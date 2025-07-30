// Quick debug script to test our group implementation
const { GroupDatabase } = require('./src/lib/GroupDatabase.ts');

// Test C3 (cyclic group of order 3)
const c3 = GroupDatabase.getGroup('C3');

console.log('C3 Group:');
console.log(
    'Elements:',
    c3.elements.map((e) => e.id)
);
console.log('Generators:', c3.generators);
console.log();

// Test multiplication table
console.log('Multiplication table:');
for (const elem1 of c3.elements) {
    const row = [];
    for (const elem2 of c3.elements) {
        const result = c3.operations.get(elem1.id)?.get(elem2.id);
        row.push(result);
    }
    console.log(`${elem1.id}: [${row.join(', ')}]`);
}
console.log();

// Test Cayley graph generation
console.log('Testing Cayley graph for C3 with generator g1:');
for (const element of c3.elements) {
    const result = c3.operations.get(element.id)?.get('g1');
    console.log(`${element.id} * g1 = ${result}`);
}
