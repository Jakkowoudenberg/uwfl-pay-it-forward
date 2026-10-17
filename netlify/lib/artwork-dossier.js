'use strict';
const c=require('./core'),images=require('./images');
function validate(d){
 if(!d||typeof d!=='object'||Array.isArray(d))c.fail(400,'artwork_dossier_required');
 const out={version:1};
 const required=['title','story','meaning','process','wood','materials','source','made','shipping','date','nationality','country'];
 for(const k of required)out[k]=c.text(d[k],['story','meaning','process','materials','source'].includes(k)?4000:500,true);
 function choice(k,n){if(!new RegExp('^[0-'+n+']$').test(String(d[k]??'')))c.fail(400,'invalid_dossier_'+k);out[k]=String(d[k]);}
 choice('design',5);choice('edition',3);choice('origin',5);
 for(const k of ['reference','designDetail','editionDetail','techDetail','originDetail','history','unknown'])out[k]=c.text(d[k],4000);
 if(['1','2'].includes(out.design)&&!out.reference)c.fail(400,'reference_required');
 if(['3','4','5'].includes(out.design)&&!out.designDetail)c.fail(400,'design_detail_required');
 if(out.edition!=='0'&&!out.editionDetail)c.fail(400,'edition_detail_required');
 out.techniques=Array.from({length:7},(_,i)=>d['tech'+i]===true?i:null).filter(i=>i!==null);
 if(!out.techniques.length)c.fail(400,'technique_required');if(out.techniques.includes(6)&&!out.techDetail)c.fail(400,'technique_detail_required');
 if(['3','4'].includes(out.origin)&&!out.originDetail)c.fail(400,'origin_detail_required');
 if(['2','3'].includes(out.origin)&&!out.history)c.fail(400,'reuse_history_required');
 if(out.origin==='5'&&!out.unknown)c.fail(400,'origin_explanation_required');
 for(const k of ['width','height','thickness','weight']){out[k]=Number(d[k]);if(!Number.isFinite(out[k])||out[k]<=0||out[k]>100000)c.fail(400,'invalid_dimensions');}
 if(!/^\d{4}-\d{2}-\d{2}$/.test(out.date)||!Number.isFinite(Date.parse(out.date))||new Date(out.date).toISOString().slice(0,10)!==out.date||out.date>new Date().toISOString().slice(0,10))c.fail(400,'invalid_production_date');
 if(d.truth!==true||d.rear!==true)c.fail(400,'confirmation_required');out.truth=true;out.rear=true;
 out.photos={};for(const k of ['front','back','detail'])out.photos[k]=images.assertImage(d.photos?.[k],'panel-photos');
 out.review_flags=[];if(['4','5'].includes(out.design))out.review_flags.push('design_needs_clarification');if(['2','3'].includes(out.edition))out.review_flags.push('edition_needs_clarification');if(['3','4','5'].includes(out.origin))out.review_flags.push('material_origin_needs_review');
 return out;
}
async function signed(row){if(!row)return null;const result={...row,details:{...row.details,number:row.participant_number,photos:{}}};for(const [k,v]of Object.entries(row.details.photos||{}))result.details.photos[k]=await images.reviewUrl(v);return result;}
module.exports={validate,signed};
