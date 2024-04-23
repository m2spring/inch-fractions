const MAX_DENOMINATOR = 32;

const INCH_DECIMALS = 3;
const MM_DECIMALS = 2;

const MAX_NOF_ROWS = 10;

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const resultArea = document.getElementById('result-area');

window.onload = function(){
  //console.log("window.onload")
  todoInput.focus();
}

todoForm.addEventListener('submit', function(event){
  event.preventDefault();
  const targetLengthMM = todoInput.value;

  if (targetLengthMM === '') {
      alert('Please enter a task!');
      return;
  }

  resultArea.innerHTML = '';
  addTable(targetLengthMM);
});

function addTable(targetLengthMM) {
  const table = document.createElement('table');
  table.setAttribute("id","result-table");

  const thead = table.createTHead();
  const row = thead.insertRow();
  
  addHdr(row,"Abs.");
  addHdr(row,"Diff.");

  {
    let th = document.createElement('th');
    th.colSpan = 4;
    th.appendChild(document.createTextNode("Fraction"));
    row.appendChild(th);
  }

  addHdr(row,"Abs.");
  addHdr(row,"Diff");
  
  resultArea.appendChild(table);

  const tbody = document.createElement('tbody');
  table.appendChild(tbody);
  addRows(tbody,targetLengthMM);
}

function addHdr(row,hdr){
  let th = document.createElement('th');
  th.appendChild(document.createTextNode(hdr));
  row.appendChild(th);
}

class Row{
  constructor(rowNo,integerInch,numerator,denominator){
    this.id = null;
    this.rowNo = rowNo;
    this.integerInch = integerInch;
    this.numerator = numerator;
    this.denominator = denominator;
    this.hideFraction = false;
  }
  setId(id){
    this.id = id;
    return this;
  }
  setHideFraction(){
    this.hideFraction = true;
    return this;
  }
  getMM(){
    return this.getInch() * 25.4;
  }
  getInch(){
    return this.integerInch + this.numerator / this.denominator;
  }
  addToTableRow(targetLengthMM,tr){
    let mm = this.getMM();
    let inch = this.getInch();

    for (let cellVal of [
      // this.rowNo,
      formatMM("",mm),
      formatMM("+",mm - targetLengthMM)
    ]){
      addCell(tr,'right',cellVal);
    }

    addCell(tr,'right',this.integerInch === 0 || this.hideFraction? "\xa0" : this.integerInch).setAttribute("id","td-fraction");
    if (this.numerator === 0 || this.hideFraction){
      for (let i=0; i<3; i++){
        let td = tr.insertCell();
        td.appendChild(document.createTextNode("\xa0"));
        td.setAttribute("id","td-fraction");
      }
    }else{
      let d = gcd(this.numerator,this.denominator);
      addCell(tr,'right',this.numerator / d).setAttribute("id","td-fraction");
      addCell(tr,'center',"/").setAttribute("id","td-fraction");
      addCell(tr,'left',this.denominator / d).setAttribute("id","td-fraction");
    }
    
    for (let cellVal of [
      formatInch("",inch),
      formatInch("+",inch - targetLengthMM / 25.4)
    ]){
      addCell(tr,'right',cellVal);
    }
  }
}

function addCell(tr,align,val){
  let td = tr.insertCell();
  td.align = align;
  td.appendChild(document.createTextNode(val));
  td.setAttribute("id","td-nonfraction");
  return td;
}

function addRows(tbody,targetLengthMM){
  let targetLengthInch = Math.abs(targetLengthMM) / 25.4;
  let numerator0 = Math.floor(MAX_DENOMINATOR * getFraction(targetLengthInch));

  let rows = [];
  let integerInch0 = Math.floor(targetLengthInch);

  let foundExact = false;
  for (let i = 0, numerator = numerator0, integerInch = integerInch0; i < MAX_NOF_ROWS; i++){
    //let row = new Row((i % 2 === 0)? "" : "tr-too-low",-1-i,integerInch,numerator,MAX_DENOMINATOR);
    let row = new Row(-1-i,integerInch,numerator,MAX_DENOMINATOR);
    let inch = row.getInch();
    if (inch === targetLengthInch){ 
      row.id = "tr-exact";
      foundExact = true; 
    }
    if (inch < 0.0){ break; }
    rows.push(row);
    if (numerator <= 0){
      numerator = MAX_DENOMINATOR;
      integerInch--;
    }
    numerator--;
  }
  rows = rows.reverse();

  if (!foundExact){ rows.push(new Row(0,targetLengthInch,null,1).setId("tr-exact").setHideFraction()); }
  for (let i = rows.length-3; i >= 0; i -= 2){
    rows[i].setId("tr-too-low");
  }

  for (let i = 0, numerator = numerator0, integerInch = integerInch0; i < MAX_NOF_ROWS; i++){
    numerator++;
    if (numerator >= MAX_DENOMINATOR){
      numerator = 0;
      integerInch++;
    }
    rows.push(new Row(1+i,integerInch,numerator,MAX_DENOMINATOR).setId((i % 2 === 0)? "" : "tr-too-high"));
  }

  for (let srcRow of rows){
    let row = tbody.insertRow();
    row.setAttribute("id",srcRow.id);
    srcRow.addToTableRow(targetLengthMM,row);
  }
}

function getFraction(floatVal){
  let floatStr = ""+floatVal;
  //console.log("floatStr      : "+floatStr);
  let p = floatStr.indexOf(".");
  //console.log("p             : "+p);
  //console.log("substring     : "+floatStr.substring(p));
  return p < 0? 0.0 : parseFloat("0"+floatStr.substring(p));
}

function formatMM(optPlus,floatVal){
  return formatFloat(optPlus,floatVal,MM_DECIMALS,"mm");
}

function formatInch(optPlus,floatVal){
  return formatFloat(optPlus,floatVal,INCH_DECIMALS,'"');
}

function formatFloat(optPlus,floatVal,nofDigits,units){
  let fmt = floatVal.toFixed(nofDigits) + units;
  return floatVal <= 0.0? fmt : optPlus + fmt;
}

function gcd(v1,v2){
  return (v2 == 0)? v1 : gcd(v2, v1 % v2);
}
