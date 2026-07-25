-- public.submit_order(): the ONLY way an order gets created.
--
-- Runs as SECURITY DEFINER so it can insert into orders/order_items despite
-- those tables having no client-facing RLS policies. It re-validates every
-- field server-side (never trusts the caller) and recomputes prices from
-- fixed constants, so a tampered client payload cannot under-price an order.

create or replace function public.submit_order(
  p_customer_name text,
  p_mobile_number text,
  p_messenger_name text,
  p_email text,
  p_fulfillment_method text,
  p_delivery_address text,
  p_payment_proof_path text,
  p_payment_reference text,
  p_customer_notes text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_size text;
  v_qty int;
  v_player_name text;
  v_unit_price constant numeric(10, 2) := 360.00;
  v_delivery_fee_amount constant numeric(10, 2) := 120.00;
  v_customization_price numeric(10, 2) := 0.00;
  v_line_total numeric(10, 2);
  v_merch_subtotal numeric(10, 2) := 0;
  v_customization_total numeric(10, 2) := 0;
  v_delivery_fee numeric(10, 2) := 0;
  v_total numeric(10, 2);
  v_item_count int := 0;
begin
  if p_customer_name is null or length(trim(p_customer_name)) < 2 then
    raise exception 'INVALID_NAME: Please enter your full name.';
  end if;

  if p_email is null or p_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' then
    raise exception 'INVALID_EMAIL: Please enter a valid email address.';
  end if;

  if p_mobile_number is null or length(regexp_replace(p_mobile_number, '\D', '', 'g')) < 10 then
    raise exception 'INVALID_MOBILE: Please enter a valid mobile number.';
  end if;

  if p_fulfillment_method not in ('pickup', 'delivery') then
    raise exception 'INVALID_FULFILLMENT: Fulfillment method must be pickup or delivery.';
  end if;

  if p_fulfillment_method = 'delivery'
     and (p_delivery_address is null or length(trim(p_delivery_address)) < 5) then
    raise exception 'INVALID_ADDRESS: Please enter a complete delivery address.';
  end if;

  if p_payment_proof_path is null or length(trim(p_payment_proof_path)) = 0 then
    raise exception 'MISSING_PROOF: Payment proof upload is required.';
  end if;

  if p_payment_proof_path !~ '^proofs/' then
    raise exception 'INVALID_PROOF_PATH: Payment proof path is invalid.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART: Add at least one shirt to your order.';
  end if;

  if jsonb_array_length(p_items) > 50 then
    raise exception 'TOO_MANY_ITEMS: Too many line items in a single order.';
  end if;

  v_delivery_fee := case when p_fulfillment_method = 'delivery' then v_delivery_fee_amount else 0.00 end;

  v_order_number := public.generate_order_number();

  insert into public.orders (
    order_number, customer_name, mobile_number, messenger_name, email,
    fulfillment_method, delivery_address, merchandise_subtotal, customization_total,
    delivery_fee, total_amount, payment_reference, payment_proof_path,
    payment_status, order_status, customer_notes
  ) values (
    v_order_number,
    trim(p_customer_name),
    trim(p_mobile_number),
    nullif(trim(p_messenger_name), ''),
    lower(trim(p_email)),
    p_fulfillment_method::fulfillment_method_enum,
    nullif(trim(p_delivery_address), ''),
    0, 0, v_delivery_fee, 0,
    nullif(trim(p_payment_reference), ''),
    p_payment_proof_path,
    'pending', 'new',
    nullif(trim(p_customer_notes), '')
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_item_count := v_item_count + 1;

    v_size := v_item ->> 'size';
    v_qty := nullif(v_item ->> 'quantity', '')::int;
    v_player_name := nullif(trim(coalesce(v_item ->> 'playerName', '')), '');

    if v_size is null or v_size not in ('XS', 'S', 'M', 'L', 'XL', '2XL', '3XL') then
      raise exception 'INVALID_SIZE: Item % has an invalid size.', v_item_count;
    end if;

    if v_qty is null or v_qty < 1 or v_qty > 20 then
      raise exception 'INVALID_QUANTITY: Item % must have a quantity between 1 and 20.', v_item_count;
    end if;

    if v_player_name is not null and length(v_player_name) > 16 then
      raise exception 'INVALID_PLAYER_NAME: Item % player name is too long.', v_item_count;
    end if;

    v_customization_price := 0.00; -- player-name customization is currently free
    v_line_total := (v_unit_price + v_customization_price) * v_qty;

    v_merch_subtotal := v_merch_subtotal + v_line_total;
    v_customization_total := v_customization_total + (v_customization_price * v_qty);

    insert into public.order_items (
      order_id, product_name, size, quantity, player_name,
      unit_price, customization_price, line_total
    ) values (
      v_order_id, 'Hungry Bullers Performance Jersey', v_size, v_qty, v_player_name,
      v_unit_price, v_customization_price, v_line_total
    );
  end loop;

  v_total := v_merch_subtotal + v_customization_total + v_delivery_fee;

  update public.orders
  set merchandise_subtotal = v_merch_subtotal,
      customization_total = v_customization_total,
      total_amount = v_total
  where id = v_order_id;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'merchandise_subtotal', v_merch_subtotal,
    'customization_total', v_customization_total,
    'delivery_fee', v_delivery_fee,
    'total_amount', v_total
  );
end;
$$;

revoke all on function public.submit_order(
  text, text, text, text, text, text, text, text, text, jsonb
) from public;

grant execute on function public.submit_order(
  text, text, text, text, text, text, text, text, text, jsonb
) to anon, authenticated;
