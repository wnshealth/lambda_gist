const Gist = require( './gist' );

exports.handler = async ( event, context, callback ) => {
  console.log( JSON.stringify( event ) );
  var gist = new Gist( event );
  await gist.create();
  return true;
}
