const AWS = require( 'aws-sdk' );
const octokit = require( '@octokit/rest' )();

var s3Bucket = new AWS.S3( { params: { Bucket: 'wns.sources' } } );

class Gist {
  constructor( event ) {
    this.event = event;
  }

  create() {
    return new Promise( ( resolve, reject ) => {
      this.s3Get()
        .then( this.createGist.bind( this ) )
        .then( () => { resolve(); } )
        .catch( () => { reject(); } );
    });
  }

  s3Get() {
    return new Promise( ( resolve, reject ) => {
      var params = {
        Key: this.event.Records[ 0 ].s3.object.key
      };

      s3Bucket.getObject( params, ( err, data ) => {
        if ( err ) return reject();
        this.data = JSON.parse( data.Body.toString( 'utf8' ) );
        resolve();
      });
    });
  }

  createGist() {
    return new Promise( ( resolve, reject ) => {
      octokit.authenticate({
        type: 'token',
        username: 'wnshealth',
        token: process.env.GITHUB_TOKEN
      });

      octokit.gists.create({
        files: this.files(),
        description: 'WNS Health lead posting instructions.',
        public: false
      }).then( result => { console.log( result ); resolve(); } );
    });
  }

  files() {
    var files = {};
    files[ this.data.source.source_id + '.md' ] = {
      'content': this.content()
    };
    return files;
  }

  content() {
    return '# WNS x ' + this.data.source.name + '\n'
      + 'WNS lead posting instructions.\n\n'
      + '__Request:__\n'
      + '* Method: `POST`\n'
      + '* URL: `https://api.wnsposting.com/v1/leads`\n'
      + '* Content type: `application/json`\n'
      + '* Token: `' + this.data.token + '`\n\n'
      + '*Token must be placed in the body of the request. Full posting instructions can be found here: [https://gist.github.com/wnshealth/745a407a68ac176421f0793ff85a1257](https://gist.github.com/wnshealth/745a407a68ac176421f0793ff85a1257)*';
  }
}

module.exports = Gist;
