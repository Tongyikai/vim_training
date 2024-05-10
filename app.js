var http = require( "http" ); 
var fs = require( "fs" );
var url = require( "url" );
let querystring = require( "querystring" );
let userController = require("./controllers/userController");
const formidable = require( "formidable" );

http.createServer( function( request, response ) {
    let post = "";
	request.on( "data", function( chunk ) {
		post += chunk;
	});

	/* *********#*********#*********#*********#*********#
	*                       POST                        * 
	#*********#*********#*********#*********#********* */
	request.on( "end", function() {
		if ( request.url === "/SignIn" ) { // ==會做轉換型別的動作, === 不會有轉換型別的問題 (int) 1 === (String) "1" 會是 false
			post = querystring.parse( post );
            console.log( "Request [ Sign In ]: " );
			console.log( post );
			userController.userLogin( post.username, post.password, ( token ) => {
				// 回傳使用者資訊
				response.writeHead( 200, { "Content-Type": "application/json" } );
				response.write( JSON.stringify( { authorization: token } ) ); // 回傳 token 給使用者, 使用者不存在會收到 authorization: empty
				response.end();
			});

        } else if ( request.url === "/SignUp" ) {
			post = querystring.parse( post );
			console.log( "Request [ Sign Up ]: " );
            console.log( post );
			userController.userRegister( post.username, post.email, post.password, () => {
				// 回傳使用者資訊
				response.writeHead( 200, { "Content-Type": "application/json" } );
				response.write( JSON.stringify( { register: "done" } ) );
				response.end();
			});

		} else if ( request.url === "/logInWithToken" ) {
			console.log( "Request [ logInWithToken ]: " );
			const token = request.headers[ "authorization" ].replace( "Bearer ", "" );
			// token驗證
			userController.tokenLogin( token, ( tokenKey ) => {
				response.writeHead( 200, { "Content-Type": "application/json" } );
				response.write( JSON.stringify( { authorization: tokenKey } ) );
				response.end();
			});

		} else if ( request.url === "/addBuddy" ) {
			console.log( "Request [ addBuddy ]: " );
			console.log( post );
			const token = request.headers[ "authorization" ].replace( "Bearer ", "" );
			userController.addBuddy( token, post, ( isFinished ) => {
				response.writeHead( 200, { "Content-Type": "application/json" } );
				response.write( JSON.stringify( { addBuddy: isFinished } ) );
				response.end();
			});

		} else if ( request.url === "/loadingProfileData" ) {
			console.log( "Request [ loadingProfileData ]: " );
			const token = request.headers[ "authorization" ].replace( "Bearer ", "" );
			userController.loadingProfile( token, ( profileData, buddyListData ) => {
				response.writeHead( 200, { "Content-Type": "application/json" } );
				response.write( JSON.stringify( { profileData: profileData, buddyListData: buddyListData } ) );
				response.end();
			});
		}
    });

	/* *********#*********#*********#*********#*********#
	*					     Form  					    *
	#*********#*********#*********#*********#********* */
	if ( request.url === "/updateProfile" && request.method.toLowerCase() === "post" ) {
		console.log( "Request [ updateProfile ]: " );
		const token = request.headers[ "authorization" ].replace( "Bearer ", "" );
		// 實例化一個傳入表單
		let form = new formidable.IncomingForm();
		// 設置文件存儲目錄
		form.uploadDir = "./uploadDir";
		// 解析傳入數據
		form.parse( request, ( err, fields, files ) => {
			if ( err ) throw err;
			userController.updateProfile( token, fields, files, () => {
				response.writeHead( 200, { "Content-Type": "application/json" } );
				response.write( JSON.stringify( { updateProfile: "finished" } ) );
				response.end();
			});
		});
	}

	if ( request.url === "/createCircle" && request.method.toLowerCase() === "post" ) {
		console.log( "Request [ createCircle ]: " );
		const token = request.headers[ "authorization" ].replace( "Bearer ", "" );
		// 實例化一個傳入表單
		let form = new formidable.IncomingForm();
		// 設置文件存儲目錄
		form.uploadDir = "./uploadDir";
		// 解析傳入數據
		form.parse( request, ( err, fields, files ) => {
			if ( err ) throw err;
			userController.createCircle( token, fields, () => {
				response.writeHead( 200, { "Content-Type": "application/json" } );
				response.write( JSON.stringify( { createCircle: "finished" } ) );
				response.end();
			});
		});
	}
   
	/* *********#*********#*********#*********#*********#
	*					      GET 					    *
	#*********#*********#*********#*********#********* */
    if ( request.url === "/" ) {
        sendFileContent( response, "views/index.html", "text/html" );
		console.log( "**** FRONTPAGE - REQUEST ****" );

    } else if ( request.url === "/index" ) {
        fs.readFile( "views/index.html", function( err, data ) {
            if ( err ) {
                console.log( err );
                response.writeHead( 404, { "Content-Type": "text/html" } );
            } else {
                response.writeHead( 200, { "Content-Type": "text/html" } );
                response.write( data.toString() );
            }
            response.end();
        });

	} else if ( request.url === "/lobby" ) {
		sendFileContent( response, "views/lobby.html", "text/html" ); 
		console.log( "**** Welcome To Entrust Lobby ****" );

    } else if ( /^\/[a-zA-Z0-9\/]*.css$/.test( request.url.toString() ) ) {
		sendFileContent( response, request.url.toString().substring( 1 ), "text/css" );
		console.log( "Response File: " + request.url.toString().substring( 1 ) );

    } else if ( /^\/[a-zA-Z0-9\/]*.png$/.test( request.url.toString() ) ) {
		sendFileContent( response, request.url.toString().substring( 1 ), "text/png" );
		console.log( "Response File: " + request.url.toString().substring( 1 ) );

	} else if ( /^\/[a-zA-Z0-9\/]*.js$/.test( request.url.toString() ) ) {
		sendFileContent( response, request.url.toString().substring( 1 ), "text/javascript" );
		console.log("Response File: " + request.url.toString().substring( 1 ) );
		
	} else if ( /^\/[a-zA-Z0-9\/]*.mp4$/.test( request.url.toString() ) ) {
		sendFileContent( response, request.url.toString().substring( 1 ), "text/mp4" );
		console.log("Response File: " + request.url.toString().substring( 1 ) );
		
	}
}).listen( 8888 ); // 使用 listen 方法绑定 8888 端口

// 終端印如下信息
console.log( "**** Server running at http://127.0.0.1:8888 ****" );

/* *********#*********#*********#*********#*********#
*					    METHOD 					    *
#*********#*********#*********#*********#********* */
function sendFileContent( response, fileName, contentType ) {
	fs.readFile( fileName, function( err, data ) {
		if( err ) {
			response.writeHead( 404 );
			response.write( "Not Found!" );
		} else {
			response.writeHead( 200, { "Content-Type": contentType } );
			response.write( data );
		}
		response.end();
	});
}

function responseClient( response, headObject, contentObject ) {
	response.writeHead( 200, headObject );
	response.write( JSON.stringify( contentObject ) );
	response.end();
}