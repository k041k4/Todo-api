// var person = {
//   name: 'Vlado',
//   age: 21
// };
//
// function updatePerson(object){
//   object.age = 45;
//   console.log(object);
//
//   object = {
//     name: 'Vlado',
//     age: 24
//   };
//   console.log(object);
// }
//
// updatePerson(person);
// console.log(person);

var array = [15, 37];

function addValue(newValue) {

  debugger;

  // array = newValue;
  console.log(array);

  array.push(newValue);
}

addValue(10);
console.log(array);
