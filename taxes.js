/* Fictional game tax rules. Not a model of any country's tax law. */
(function(root){
 'use strict';
 const RULES={version:1,weeksPerYear:52,personalRate:.12,personalAllowance:5000,labelRate:.2,graceWeeks:4,lateEveryWeeks:4,lateRate:.01};
 const round=n=>Math.round(n*100)/100,copy=x=>JSON.parse(JSON.stringify(x)),cash=(s,k)=>Math.max(0,Number(k==='label'?s.label?.cash:s.cash)||0);
 const accounts=['personal','label'];
 const exemptIncome=new Set(['loan','advance','internal-transfer','sale','tax-reserve']);
 const deductible=new Set(['expense','production','feature','promotion','ads','action','management','team','show','band-show','merch-cost','merch-partner','ppv','business','maintenance','interest','travel','label-development']);
 function account(week){return{startedWeek:week,income:0,noncashIncome:0,deductions:0,capitalGains:0,excluded:0,legacyUnclassified:0,reserve:0,reserveRate:0,autoPay:false};}
 function initial(s){const week=s.week;return{version:1,trackedFromWeek:week,periodStartWeek:week,nextAssessmentWeek:week+51,year:1,lastClosedWeek:week-1,accounts:{personal:account(week),...(s.label?{label:account(week)}:{})},bills:[],totalAssessed:0,totalPaid:0,totalPenalties:0};}
 function ensure(s){if(s.taxes===undefined)s.taxes=initial(s);if(s.label&&!s.taxes.accounts.label)s.taxes.accounts.label=account(s.week);return s.taxes;}
 function reconcile(s){const t=ensure(s);for(const k of accounts)if(t.accounts[k])t.accounts[k].reserve=round(Math.min(t.accounts[k].reserve,cash(s,k)));return t;}
 function spendable(s,k='personal'){const a=s.taxes?.accounts?.[k];return round(Math.max(0,cash(s,k)-(a?.reserve||0)));}
 function record(s,k,amount,category,details={}){
  const t=ensure(s),a=t.accounts[k];if(!a)return;
  if(amount>0){
   if(category==='sale')a.excluded=round(a.excluded+amount);
   else if(category==='label-settlement'){
    if(details.known!==true){a.legacyUnclassified=round(a.legacyUnclassified+amount);a.excluded=round(a.excluded+amount);}
    else{const capital=round(Math.min(amount,Math.max(0,Number(details.capitalReturn)||0))),earned=round(amount-capital);a.excluded=round(a.excluded+capital);a.income=round(a.income+earned);a.reserve=round(a.reserve+earned*a.reserveRate);}
   }else if(exemptIncome.has(category))a.excluded=round(a.excluded+amount);
   else{a.income=round(a.income+amount);a.reserve=round(a.reserve+amount*a.reserveRate);}
  }else if(amount<0&&deductible.has(category)&&details.deductible!==false)a.deductions=round(a.deductions-amount);
  a.reserve=round(Math.min(a.reserve,cash(s,k)));
 }
 function noncash(s,k,amount){if(!(amount>0))return;const a=ensure(s).accounts[k];if(a)a.noncashIncome=round(a.noncashIncome+amount);}
 function capitalGain(s,k,proceeds,basis){const a=ensure(s).accounts[k];if(!a)return;const gain=round(Math.max(0,proceeds-basis));a.capitalGains=round(a.capitalGains+gain);a.excluded=round(Math.max(0,a.excluded-gain));a.reserve=round(Math.min(cash(s,k),a.reserve+gain*a.reserveRate));}
 function estimate(a,k){const revenue=round(a.income+a.noncashIncome+a.capitalGains),profit=round(Math.max(0,revenue-a.deductions)),allowance=k==='personal'?RULES.personalAllowance:0,taxable=round(Math.max(0,profit-allowance)),rate=k==='personal'?RULES.personalRate:RULES.labelRate;return{revenue,profit,allowance,taxable,rate,tax:round(taxable*rate)};}
 function liability(s,k){return round((s.taxes?.bills||[]).filter(b=>(!k||b.account===k)&&b.balance>0).reduce((n,b)=>n+b.balance,0));}
 function payBills(s,k,wanted,write,billId){
  const t=s.taxes,a=t?.accounts?.[k];if(!a)return{ok:false,message:'No hay una liquidación pendiente en esta cuenta.'};
  const bills=t.bills.filter(b=>b.account===k&&b.balance>0&&(!billId||b.id===billId)).sort((a,b)=>a.assessedWeek-b.assessedWeek);
  const owed=round(bills.reduce((n,b)=>n+b.balance,0));if(!owed)return{ok:false,message:'No hay una liquidación pendiente en esa selección.'};
  if(wanted!==undefined&&(!Number.isFinite(wanted)||wanted<=0||round(wanted)!==wanted||wanted>cash(s,k)+.001))return{ok:false,message:'Introduce un importe positivo disponible, con hasta dos decimales.'};
  let left=round(Math.min(owed,cash(s,k),wanted===undefined?owed:wanted)),paid=left;if(left<=0)return{ok:false,message:'No hay caja disponible para pagar. La deuda permanece pendiente.'};
  for(const b of bills){const amount=round(Math.min(left,b.balance));if(!amount)break;const penalty=round(Math.min(b.penaltyBalance,amount));b.penaltyBalance=round(b.penaltyBalance-penalty);b.principalBalance=round(b.principalBalance-(amount-penalty));b.paid=round(b.paid+amount);b.balance=round(b.principalBalance+b.penaltyBalance);b.status=b.balance===0?'paid':s.week>b.dueWeek?'overdue':'open';if(!b.balance)b.paidWeek=s.week;left=round(left-amount);}
  a.reserve=round(Math.max(0,a.reserve-paid));write(k,'Pago de impuestos simulados',-paid,'tax-payment');t.totalPaid=round(t.totalPaid+paid);return{ok:true,paid,message:'Impuestos pagados: $'+paid.toLocaleString('es-CO')+'. El saldo restante conserva su vencimiento.'};
 }
 function closeWeek(s,write,report){
  const t=reconcile(s),week=s.week;if(t.lastClosedWeek>=week)return;t.lastClosedWeek=week;
  if(week>=t.nextAssessmentWeek){
   for(const k of accounts){const a=t.accounts[k];if(!a)continue;const e=estimate(a,k),id='tax-'+k+'-'+t.nextAssessmentWeek;
    const bill={id,account:k,year:t.year,periodStartWeek:t.periodStartWeek,assessedWeek:week,dueWeek:week+RULES.graceWeeks,...e,income:a.income,noncashIncome:a.noncashIncome,deductions:a.deductions,capitalGains:a.capitalGains,legacyUnclassified:a.legacyUnclassified,principalBalance:e.tax,penaltyBalance:0,penalties:0,paid:0,balance:e.tax,status:e.tax?'open':'paid',lastPenaltyWeek:week};
    t.bills.push(bill);t.totalAssessed=round(t.totalAssessed+e.tax);report.highlights.push('Liquidación anual simulada · '+(k==='personal'?'personal':'sello')+': $'+e.tax.toLocaleString('es-CO')+'; base $'+e.taxable.toLocaleString('es-CO')+'. '+(e.tax?'Vence S'+bill.dueWeek+'.':'Sin impuesto a pagar.'));
    for(const key of ['income','noncashIncome','deductions','capitalGains','excluded','legacyUnclassified'])a[key]=0;
   }
   t.year++;t.periodStartWeek=week+1;t.nextAssessmentWeek=week+RULES.weeksPerYear;
  }
  for(const b of t.bills)if(b.balance>0){
   if(week>b.dueWeek)b.status='overdue';
   if(b.principalBalance>0&&week>=b.dueWeek+RULES.lateEveryWeeks&&(week-b.dueWeek)%RULES.lateEveryWeeks===0&&b.lastPenaltyWeek<week){const fee=round(Math.max(.01,b.principalBalance*RULES.lateRate));b.penaltyBalance=round(b.penaltyBalance+fee);b.penalties=round(b.penalties+fee);b.balance=round(b.balance+fee);b.lastPenaltyWeek=week;t.totalPenalties=round(t.totalPenalties+fee);s.player.reputation=Math.max(0,round(s.player.reputation-.25));report.highlights.push('Impuesto atrasado '+b.id+': recargo simulado $'+fee.toLocaleString('es-CO')+'. La deuda sigue pendiente.');}
  }
  for(const k of accounts)if(t.accounts[k]?.autoPay&&liability(s,k)>0){const result=payBills(s,k,undefined,write);if(result.ok)report.highlights.push('Pago automático de impuestos · '+(k==='personal'?'personal':'sello')+': $'+result.paid.toLocaleString('es-CO')+'.');}
  const paid=t.bills.filter(b=>!b.balance);if(paid.length>48){const remove=new Set(paid.slice(0,paid.length-48).map(b=>b.id));t.bills=t.bills.filter(b=>!remove.has(b.id));}
 }
 function act(s,p,write){
  const k=p.account||'personal';if(!accounts.includes(k)||k==='label'&&!s.label)return{ok:false,message:'Elige caja personal o la de tu sello.'};
  if(p.decision==='settings'){
   if(p.reserveRate!==undefined&&(!Number.isFinite(Number(p.reserveRate))||Number(p.reserveRate)<0||Number(p.reserveRate)>.5))return{ok:false,message:'La reserva automática debe estar entre 0% y 50%.'};
   if(p.autoPay!==undefined&&typeof p.autoPay!=='boolean')return{ok:false,message:'La autorización de pago debe ser sí o no.'};
   const a=ensure(s).accounts[k];if(p.reserveRate!==undefined)a.reserveRate=Number(p.reserveRate);if(p.autoPay!==undefined)a.autoPay=p.autoPay;return{ok:true,message:'Preferencias fiscales actualizadas. No se ha movido dinero; las obligaciones son exigibles aunque no autorices su pago automático.'};
  }
  if(p.decision==='reserve'){
   const n=Number(p.amount),previous=s.taxes?.accounts?.[k]?.reserve||0;if(!Number.isFinite(n)||n===0||round(n)!==n||n>spendable(s,k)+.001||-n>previous+.001)return{ok:false,message:'El importe debe estar disponible para apartar o liberar, con hasta dos decimales.'};
   const a=ensure(s).accounts[k];a.reserve=round(a.reserve+n);return{ok:true,message:n>0?'Reserva marcada dentro de esta caja; no aumenta tu patrimonio.':'Reserva liberada. La obligación fiscal no desaparece.'};
  }
  if(p.decision==='pay')return payBills(s,k,p.amount===undefined?undefined:Number(p.amount),write,p.billId);
  return{ok:false,message:'Elige reservar, pagar o cambiar las preferencias fiscales.'};
 }
 function summary(s){
  if(!s||s.financialHold)return{blocked:true,accounts:[],bills:[],totalDebt:0};
  const t=s.taxes||initial(s),rows=accounts.filter(k=>k==='personal'||s.label).map(k=>{const a=t.accounts[k]||account(s.week),reserved=round(Math.min(a.reserve,cash(s,k))),e=estimate(a,k),debt=liability(s,k),payment=a.autoPay?round(Math.min(cash(s,k),debt+(s.week>=t.nextAssessmentWeek?e.tax:0))):0;return{account:k,name:k==='personal'?'Personal':s.label.name,trackedFromWeek:a.startedWeek,cash:Number(k==='label'?s.label?.cash:s.cash)||0,reserved,spendable:round(Math.max(0,cash(s,k)-reserved)),reserveRate:a.reserveRate,autoPay:a.autoPay,...e,income:a.income,noncashIncome:a.noncashIncome,deductions:a.deductions,capitalGains:a.capitalGains,excluded:a.excluded,legacyUnclassified:a.legacyUnclassified,debt,estimatedPayment:payment};});
  return{version:1,trackedFromWeek:t.trackedFromWeek,periodStartWeek:t.periodStartWeek,nextAssessmentWeek:t.nextAssessmentWeek,year:t.year,rules:copy(RULES),accounts:rows,bills:copy(t.bills),totalDebt:liability(s),totalReserved:round(rows.reduce((n,a)=>n+a.reserved,0)),totalAssessed:t.totalAssessed,totalPaid:t.totalPaid,totalPenalties:t.totalPenalties,legacy:t.trackedFromWeek>1&&t.year===1};
 }
 function validate(s){
  if(s.taxes===undefined)return[];const t=s.taxes,errors=[],bad=()=>errors.push('Registro de impuestos inválido.'),integer=n=>Number.isInteger(n)&&n>=1,nonnegative=n=>Number.isFinite(n)&&n>=0;
  if(!t||t.version!==1||!integer(t.trackedFromWeek)||t.trackedFromWeek>s.week||!integer(t.periodStartWeek)||!integer(t.nextAssessmentWeek)||t.nextAssessmentWeek<t.periodStartWeek||!integer(t.year)||!Number.isInteger(t.lastClosedWeek)||t.lastClosedWeek<0||t.lastClosedWeek>s.week||!t.accounts||!t.accounts.personal||!Array.isArray(t.bills)||t.bills.length>40000||!['totalAssessed','totalPaid','totalPenalties'].every(k=>nonnegative(t[k])))return['Registro de impuestos inválido.'];
  for(const k of Object.keys(t.accounts)){const a=t.accounts[k];if(!accounts.includes(k)||!a||!integer(a.startedWeek)||a.startedWeek>s.week||!['income','noncashIncome','deductions','capitalGains','excluded','legacyUnclassified','reserve','reserveRate'].every(key=>nonnegative(a[key]))||a.reserveRate>.5||typeof a.autoPay!=='boolean')bad();}
  const ids=new Set();for(const b of t.bills){
   if(!b||typeof b.id!=='string'||ids.has(b.id)||!accounts.includes(b.account)||!integer(b.year)||!integer(b.periodStartWeek)||!integer(b.assessedWeek)||b.assessedWeek>s.week||!integer(b.dueWeek)||b.dueWeek!==b.assessedWeek+RULES.graceWeeks||!['revenue','profit','allowance','taxable','rate','tax','income','noncashIncome','deductions','capitalGains','legacyUnclassified','principalBalance','penaltyBalance','penalties','paid','balance','lastPenaltyWeek'].every(k=>nonnegative(b[k]))||!['open','overdue','paid'].includes(b.status)||Math.abs(b.balance-b.principalBalance-b.penaltyBalance)>.02||Math.abs(b.tax+b.penalties-b.paid-b.balance)>.025||b.status==='paid'&&b.balance!==0)bad();
   if(b){ids.add(b.id);const e=estimate(b,b.account);if(b.rate!==e.rate||b.allowance!==e.allowance||Math.abs(b.revenue-e.revenue)>.025||Math.abs(b.profit-e.profit)>.025||Math.abs(b.taxable-e.taxable)>.025||Math.abs(b.tax-e.tax)>.025||b.principalBalance>b.tax+.025||b.penaltyBalance>b.penalties+.025||!Number.isInteger(b.lastPenaltyWeek)||b.lastPenaltyWeek<b.assessedWeek||b.lastPenaltyWeek>s.week)bad();}
  }
  return[...new Set(errors)];
 }
 const api={rules:RULES,ensure,reconcile,record,noncash,capitalGain,spendable,liability,closeWeek,act,summary,validate};root.RapTaxes=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
