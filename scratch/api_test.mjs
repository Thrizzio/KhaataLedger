import fs from 'fs';

async function runTests() {
  const BASE_URL = 'http://localhost:5000/api';
  let token = '';
  let employeeToken = '';
  let workspaceId = '';
  let customerId = '';
  let supplierId = '';
  let inventoryItemId = '';

  const log = (msg) => console.log(msg);
  const assert = (condition, msg) => {
    if (!condition) {
      console.error('❌ FAIL: ' + msg);
      throw new Error(msg);
    }
    console.log('✅ PASS: ' + msg);
  };

  try {
    // 1. AUTHENTICATION
    log('--- 1. AUTHENTICATION ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login/owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john@hardware.com', password: 'Password123' })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Owner login valid credentials');
    token = loginData.data.token;

    const invalidLoginRes = await fetch(`${BASE_URL}/auth/login/owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john@hardware.com', password: 'wrong' })
    });
    assert(invalidLoginRes.status === 401, 'Owner login invalid password returns 401');

    // 2. DASHBOARD / WORKSPACES
    log('--- 2. WORKSPACES ---');
    const wsRes = await fetch(`${BASE_URL}/workspaces`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const wsData = await wsRes.json();
    assert(wsRes.status === 200, 'Fetch workspaces');
    workspaceId = wsData.data[0].id;

    // 4. CUSTOMERS
    log('--- 4. CUSTOMERS ---');
    const custRes = await fetch(`${BASE_URL}/workspaces/${workspaceId}/customers`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Customer', phoneNumber: '1234567890' })
    });
    const custData = await custRes.json();
    assert(custRes.status === 201, 'Create customer');
    customerId = custData.data.id;
    assert(Number(custData.data.outstandingBalance) === 0, 'Initial customer balance is 0');

    // 5. SUPPLIERS
    log('--- 5. SUPPLIERS ---');
    const supRes = await fetch(`${BASE_URL}/workspaces/${workspaceId}/suppliers`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Supplier', phoneNumber: '0987654321' })
    });
    const supData = await supRes.json();
    assert(supRes.status === 201, 'Create supplier');
    supplierId = supData.data.id;
    assert(Number(supData.data.outstandingBalance) === 0, 'Initial supplier balance is 0');

    const rand = Math.random().toString(36).substring(7);

    // 6. INVENTORY
    log('--- 6. INVENTORY ---');
    const invRes = await fetch(`${BASE_URL}/workspaces/${workspaceId}/inventory`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Item ' + rand, sku: 'TST-' + rand, unit: 'pcs', defaultSellingPrice: 100 })
    });
    const invData = await invRes.json();
    if (invRes.status !== 201) console.error(invData);
    assert(invRes.status === 201, 'Create inventory item');
    inventoryItemId = invData.data.id;
    assert(invData.data.currentStock === 0, 'Initial stock is 0');

    // 7. PURCHASES
    log('--- 7. PURCHASES ---');
    const purRes = await fetch(`${BASE_URL}/workspaces/${workspaceId}/purchases`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierId,
        purchaseDate: new Date().toISOString(),
        paymentType: 'CREDIT',
        items: [{ inventoryItemId, quantity: 10, purchasePrice: 50 }]
      })
    });
    const purData = await purRes.json();
    if(purRes.status !== 201) console.error(purData);
    assert(purRes.status === 201, 'Create purchase');

    // Check stock after purchase
    const invAfterPurRes = await fetch(`${BASE_URL}/workspaces/${workspaceId}/inventory`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const invAfterPurData = await (invAfterPurRes).json();
    const updatedItem = invAfterPurData.data.items.find(i => i.id === inventoryItemId);
    assert(updatedItem.currentStock === 10, 'Stock increased to 10 after purchase');

    // Check supplier balance after CREDIT purchase (10 * 50 = 500)
    const supAfterPurRes = await fetch(`${BASE_URL}/workspaces/${workspaceId}/suppliers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const supAfterPurData = await supAfterPurRes.json();
    if (!supAfterPurData.data.suppliers) {
      console.log("Suppliers data structure:", supAfterPurData);
    }
    const updatedSup = supAfterPurData.data.suppliers?.find(s => s.id === supplierId) || supAfterPurData.data.items?.find(s => s.id === supplierId) || supAfterPurData.data.find(s => s.id === supplierId);
    if (!updatedSup) throw new Error("Could not find updated supplier");
    assert(Number(updatedSup.outstandingBalance) === 500, 'Supplier balance increased by 500 for CREDIT purchase');

    // 8. SALES
    log('--- 8. SALES ---');
    // Cash Sale (should not affect customer balance)
    const saleCashRes = await fetch(`${BASE_URL}/workspaces/${workspaceId}/sales`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        saleDate: new Date().toISOString(),
        paymentType: 'CASH',
        items: [{ inventoryItemId, quantity: 2, sellingPrice: 100 }]
      })
    });
    const saleCashData = await saleCashRes.json();
    if(saleCashRes.status !== 201) console.error(saleCashData);
    assert(saleCashRes.status === 201, 'Create CASH sale');

    // Check customer balance (should be 0)
    const custAfterCashRes = await fetch(`${BASE_URL}/workspaces/${workspaceId}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const custAfterCashData = await custAfterCashRes.json();
    let updatedCust = custAfterCashData.data.customers.find(c => c.id === customerId);
    assert(Number(updatedCust.outstandingBalance) === 0, 'Customer balance unchanged by CASH sale');

    // Credit Sale (should affect customer balance)
    const saleCreditRes = await fetch(`${BASE_URL}/workspaces/${workspaceId}/sales`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        saleDate: new Date().toISOString(),
        paymentType: 'CREDIT',
        items: [{ inventoryItemId, quantity: 3, sellingPrice: 100 }]
      })
    });
    assert(saleCreditRes.status === 201, 'Create CREDIT sale');
    
    // Check stock after sales (started at 10, sold 2 + 3 = 5. Remaining = 5)
    const invAfterSaleRes = await fetch(`${BASE_URL}/workspaces/${workspaceId}/inventory`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const invAfterSaleData = await invAfterSaleRes.json();
    const updatedItemAfterSale = invAfterSaleData.data.items.find(i => i.id === inventoryItemId);
    assert(updatedItemAfterSale.currentStock === 5, 'Stock decreased to 5 after sales');

    // Check customer balance (3 * 100 = 300)
    const custAfterCreditRes = await fetch(`${BASE_URL}/workspaces/${workspaceId}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const custAfterCreditData = await custAfterCreditRes.json();
    updatedCust = custAfterCreditData.data.customers.find(c => c.id === customerId);
    assert(Number(updatedCust.outstandingBalance) === 300, 'Customer balance increased by 300 for CREDIT sale');

    // 9. PAYMENTS
    log('--- 9. PAYMENTS ---');
    const custPayRes = await fetch(`${BASE_URL}/workspaces/${workspaceId}/customer-payments`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        amount: 100,
        paymentDate: new Date().toISOString()
      })
    });
    assert(custPayRes.status === 201, 'Record customer payment');

    const custAfterPayRes = await fetch(`${BASE_URL}/workspaces/${workspaceId}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const custAfterPayData = await custAfterPayRes.json();
    updatedCust = custAfterPayData.data.customers.find(c => c.id === customerId);
    assert(Number(updatedCust.outstandingBalance) === 200, 'Customer balance decreased by 100 after payment');

    // Edge case: Negative quantity sale
    const negSaleRes = await fetch(`${BASE_URL}/workspaces/${workspaceId}/sales`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        saleDate: new Date().toISOString(),
        paymentType: 'CASH',
        items: [{ inventoryItemId, quantity: -1, sellingPrice: 100 }]
      })
    });
    assert(negSaleRes.status === 400, 'Negative quantity in sale returns 400');

    // Edge case: Insufficient stock sale
    const largeSaleRes = await fetch(`${BASE_URL}/workspaces/${workspaceId}/sales`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        saleDate: new Date().toISOString(),
        paymentType: 'CASH',
        items: [{ inventoryItemId, quantity: 100, sellingPrice: 100 }]
      })
    });
    const largeSaleData = await largeSaleRes.json();
    assert(largeSaleRes.status === 400, 'Insufficient stock sale returns 400: ' + largeSaleData.message);

    log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
  } catch (e) {
    console.error('\n❌ TEST SUITE FAILED:', e);
  }
}

runTests();
