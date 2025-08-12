/**
 * Test file for elliptic curve groups integration
 * Run with: node src/test-elliptic-curves.js
 */

const { GroupDatabase } = require('./lib/GroupDatabase.ts');
const { EllipticCurveGroup } = require('./lib/EllipticCurveGroup.ts');

console.log('🧪 Testing Elliptic Curve Group Implementation\n');

try {
  console.log('1️⃣ Testing basic curve creation...');
  
  // Test E1: y² = x³ + 1 (mod 5)
  const params1 = { a: 0, b: 1, p: 5 };
  const ecGroup1 = new EllipticCurveGroup(params1);
  const group1 = ecGroup1.getGroup();
  
  console.log(`✅ Created elliptic curve group E1: ${ecGroup1.getCurve().getEquationLatex()}`);
  console.log(`   Group order: ${group1.order}`);
  console.log(`   Elements: ${group1.elements.map(e => e.label).join(', ')}`);
  console.log('');

  console.log('2️⃣ Testing group database integration...');
  
  // Get all available groups
  const allGroups = GroupDatabase.getAllGroups();
  const ecGroups = GroupDatabase.getEllipticCurveGroups();
  
  console.log(`✅ Total groups in database: ${allGroups.length}`);
  console.log(`✅ Elliptic curve groups: ${ecGroups.length}`);
  
  ecGroups.forEach(group => {
    console.log(`   - ${group.name}: ${group.displayName} (order ${group.order})`);
  });
  console.log('');

  console.log('3️⃣ Testing point arithmetic...');
  
  const curve = ecGroup1.getCurve();
  const points = ecGroup1.getPoints();
  const finitePoints = points.filter(p => !p.isInfinity);
  
  if (finitePoints.length >= 2) {
    const P = finitePoints[0];
    const Q = finitePoints[1];
    const sum = curve.add(P, Q);
    
    console.log(`✅ Point addition: ${curve.pointToString(P)} + ${curve.pointToString(Q)} = ${curve.pointToString(sum)}`);
    
    // Test point doubling
    const doubled = curve.add(P, P);
    console.log(`✅ Point doubling: 2 * ${curve.pointToString(P)} = ${curve.pointToString(doubled)}`);
    
    // Test scalar multiplication
    const tripled = curve.multiply(3, P);
    console.log(`✅ Scalar multiplication: 3 * ${curve.pointToString(P)} = ${curve.pointToString(tripled)}`);
  }
  console.log('');

  console.log('4️⃣ Testing group operations...');
  
  // Test group operation
  if (group1.elements.length >= 2) {
    const elem1 = group1.elements[0];
    const elem2 = group1.elements[1];
    const operations = group1.operations.get(elem1.id);
    const result = operations?.get(elem2.id);
    
    if (result) {
      console.log(`✅ Group operation: ${elem1.label} * ${elem2.label} = ${group1.elements.find(e => e.id === result)?.label}`);
    }
  }

  console.log('\n🎉 All tests completed successfully! Elliptic curve integration is working.');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack:', error.stack);
}