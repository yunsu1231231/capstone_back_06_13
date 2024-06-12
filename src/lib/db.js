// const mysql = require('mysql2');
const mysql = require('mysql2/promise');

const dotenv = require('dotenv');

dotenv.config();

// 참고 자료, db 쿼리를 어떻게 사용하는지 
// https://velog.io/@shunny/Node.js-MySQL-%EC%97%B0%EB%8F%99
// https://velog.io/@steveloper/node.js-mysql2promise-%EC%82%AC%EC%9A%A9%EB%B2%95

const db_config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '022skt342m!', // 개인비번 
  database: process.env.DB_NAME || 'capstone', // 이름 
  multipleStatements: true
}
const pool = mysql.createPool(db_config)

// 단순한 읽기
async function runQuery(query) {
	const connection = await pool.getConnection(async(conn) => conn);
  const [rows, _fields] = await connection.query(query);
  connection.release();
  return rows;
}

// 고칠 때
async function executeQuery(query, dataArray) {
	const connection = await pool.getConnection(async(conn) => conn);
  if (dataArray) {
    const [result, _fields] = await connection.execute(query, dataArray)
    connection.release();
    return result;
  } else {
    const [result, _fields] = await connection.execute(query)
    connection.release();
    return result;
  }
}

// 사용 예
// try {
//   const user_id = 1;
//   const data = await runQuery(`SELECT * FROM users WHERE id = ${user_id};`)
//   console.log(data)
// } catch (error) {
//   console.log("failed to fetch.")
// }


module.exports = {
  pool,
  runQuery,
  executeQuery
}



// const connection = mysql.createConnection(db_config);

// connection.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL database: ' + err.stack);
//     return;
//   }
//   console.log('Connected to MySQL database as id ' + connection.threadId);

//   var sql = 'SELECT * FROM users';
//   connection.query(sql, function(err, rows, fields) {
//     if (err) {
//       console.error('Error executing query: ' + err.stack);
//       return;
//     }
//     console.log(rows);
//     connection.end(); // 쿼리 실행 후에 연결 종료
//   });
// });

