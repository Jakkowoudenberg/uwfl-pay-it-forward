import core from '../lib/core.js';
import auth from '../lib/participant-auth.js';
export default async (request, context) => {
  if (request.method !== 'POST') return Response.json({ok:false,error:'method_not_allowed'},{status:405,headers:{'Cache-Control':'no-store'}});
  const length = request.headers.get('content-length');
  if (length && Number(length)>16384) return Response.json({ok:false,error:'request_too_large'},{status:413});
  const body = await request.text();
  if (body.length>16384) return Response.json({ok:false,error:'request_too_large'},{status:413});
  const result = await core.endpoint('POST',auth.requestLink)({
    httpMethod:'POST', body, headers:{'x-nf-client-connection-ip':context.ip || 'unknown'}
  });
  const headers = {...result.headers};
  delete headers['Access-Control-Allow-Origin'];
  delete headers['Access-Control-Allow-Headers'];
  delete headers['Access-Control-Allow-Methods'];
  return new Response(result.body,{status:result.statusCode,headers});
};
