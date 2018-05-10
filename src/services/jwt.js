const axios = require('axios');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

const userPoolId = process.env.COGNITO_POOL_ID;
const cognitoRegion = process.env.COGNITO_REGION;
const jwtIssuer = `https://cognito-idp.${cognitoRegion}.amazonaws.com/${userPoolId}`;
const jwkAddress = `https://cognito-idp.${cognitoRegion}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
let jwt_set = "";
const pems = {}


axios.get(jwkAddress)
  .then(function (response) {
    jwt_set = response.data;
    console.log(response.data);

    for(let i = 0; i<jwt_set.keys.length; i++){
      const jwk = {
      kty: jwt_set.keys[i].kty,
      n: jwt_set.keys[i].n,
      e: jwt_set.keys[i].e
      }
      // convert jwk object into PEM
      const pem = jwkToPem(jwk)
      // append PEM to the pems object, with the kid as the identifier
      pems[jwt_set.keys[i].kid] = pem
    }
 
    console.log(pems);
    debugger
  })
  .catch(function (error) {
    console.log(error);
  });

exports.authCheck = function(req, res, next){
 const jwtToken = req.headers.jwt
 ValidateToken(pems, jwtToken)
   .then((data)=>{
    console.log(data)
    next()
   })
   .catch((err)=>{
    console.log(err)
    res.send(err)
   })
}

function ValidateToken(pems, jwtToken){
  const p = new Promise((res, rej)=>{
   // PART 1: Decode the JWT token
   const decodedJWT = jwt.decode(jwtToken, {complete: true})
   // PART 2: Check if its a valid JWT token
   if(!decodedJWT){
    rej("Not a valid JWT token")
   }
   // PART 3: Check if ISS matches our userPool Id
   console.log(decodedJWT.payload.iss);
   console.log(jwtIssuer);
   if(decodedJWT.payload.iss != jwtIssuer){
    rej({
     message: "invalid issuer",
     iss: decodedJWT.payload
    })
   }
   // PART 4: Check that the jwt is an AWS 'Access Token'
   if (decodedJWT.payload.token_use != 'access') {
      rej("Not an access token")
   }
   // PART 5: Match the PEM against the request KID
   const kid = decodedJWT.header.kid
   const pem = pems[kid]
   if(!pem){
    rej('Invalid access token')
   }
   console.log("Decoding the JWT with PEM!")
   // PART 6: Verify the signature of the JWT token to ensure its really coming from your User Pool
   jwt.verify(jwtToken, pem, {issuer: jwtIssuer}, function(err, payload){
    if(err){
     rej("Unauthorized signature for this JWT Token")
    }else{
     // if payload exists, then the token is verified!
     res(payload)
    }
   })
  })
  return p
 }