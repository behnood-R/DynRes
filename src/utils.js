import random from 'random';
import BinaryTree from "./classes/BinaryTree";

const EPSILON = 0.00000001

export const getRndInteger = (min, max) => random.int(min, max);

const add = (accumulator, a) => {
  return accumulator + a;
}

export const sum = (value) => [...value].reduce(add, 0); // with initial value to avoid when the array is empty


export const makeSequence = (child1AddedVale, child2AddedVale, sizeLimit) => {
  const tree = new BinaryTree(1, child1AddedVale);
  const keys = [1];
  const add = (parent, value) => {
    const child1Index = parent * 10 + 1;
    const child2Index = parent * 10 + 2;
    const child1Value = value + child1AddedVale;
    const child2Value = value + child2AddedVale;
    if (child1Value<=sizeLimit) {
      tree.insert(parent,child1Index,child1Value)
    }
    if(child2Value<=sizeLimit){
      keys.push(child2Index)
      tree.insert(parent,child2Index,child2Value, { right: true })
    }
    if(child1Value<sizeLimit+child1AddedVale){
      keys.push(child1Index)
      add(child1Index,child1Value)
    }
    if(child2Value<sizeLimit+child1AddedVale){
      add(child2Index,child2Value)
    }
  }
  add(1,child1AddedVale);
  return Array.from(new Set(keys)).sort((a,b)=>a-b);
}

export const subtractString = (a,b,Pgg,Pbb,Pbg,Pgb) => {
  const stringA = `${a}`;
  const stringB = `${b}`;
  const arrayA = stringA.split('')
  const arrayB = stringB.split('')
  const diff = arrayB.length - arrayA.length
  if(diff === 1){
    if(stringB.indexOf(stringA)===0){
       const last = arrayB[arrayB.length-1]
       const secondLast = arrayB[arrayB.length-2]
       if (secondLast === '1') {
         if( last === '1'){
          return Pgg;
         }else {
          return Pgb;
         }
       } else {
        if(last === '1'){
          return Pbg;
        }else {
          return Pbb;
        }
       }
    }
  }
  return 0;
}

export const getFraction = (matrix, first, last) => {
  const rowCount = last[0] - first[0] + 1;
  const columnCount = last[1] - first[1] + 1;
  const result = Array.from({length: rowCount}, e => Array(columnCount).fill(0));
  const needRowNormilization = first[0] > 0;
  const needColumnNormilization = first[1] > 0;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix.length; j++) {
      if(i>=first[0]&& i<= last[0] && j >= first[1] && j <= last[1]){
        const newI = needRowNormilization ? i-first[0] : i;
        const newJ = needColumnNormilization ? j-first[1] : j;
        result[newI][newJ] = matrix[i][j]
      }
    }
  }
  return result;
}

export const getRandWithP = (p) => {
  const rnd = Math.random()*100
  if(rnd<=p){
    return 1;
  } else {
    return 2;
  }
}

export const im = (n) => { 
  let a = Array.apply(null, new Array(n)); 
  return a.map(
    (x, i) => { 
      return a.map((y, k) => { 
        return i === k ? 1 : 0; 
      }) 
    }) 
  }

