// const Joi = require('joi');
// const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');


const db = require('../../lib/db')

// https://velog.io/@unknown9732/Express.js-%EC%97%90%EC%84%9C-Route-parameter-Query-string-%EB%B0%9B%EA%B8%B0
// 여러개도 가능  
// router.get('/artists/:id/company/:company', function (req, res) {
//     res.send("id : " + req.params.id + " 회사 : " + req.params.company)
//   });

// 예) /artists?name=adele
// router.get('/artists', function (req, res) {
//     console.log("이름은 " + req.query.name + " 입니다")
//     res.send("name : " + req.query.name)
//   }); 

const register = async (req, res, next) => {
  try {
    // 클라이언트로부터 받은 요청의 body에서 사용자 정보를 추출합니다.
    
    // const {user_id, username, password, email, is_trainer, specialization } = req.body;

    const {username, password, email, confirmPassword, postname, is_trainer, specialization } = req.body;
    

    // 데이터베이스에 등록할 새로운 사용자 정보를 삽입하는 쿼리를 작성합니다.
    const query = `INSERT INTO users (username,email,password,confirmPassword,postname) VALUES (?, ?, ?, ?, ?)`;

    // executeQuery 함수를 사용하여 쿼리를 실행합니다.
    // confirmPassword 부분이랑 password 일치 여부 판단 필요 
    await db.executeQuery(query, [username, email, password, confirmPassword, postname]);

    
    if (is_trainer == true) {
      const get_user_query = `SELECT user_id FROM users WHERE email = '${email}'`
      const user_result = await db.runQuery(get_user_query)
      console.log("register is_trainer get_user_query", user_result)
      const user_id = user_result[0].user_id

      const query_2 = 'INSERT INTO trainers (trainer_id, trainer_name, trainer_specialization) VALUES (?,?,?)' 
      await db.executeQuery(query_2, [user_id, username, specialization]);   
    }
    

    // 등록이 성공하면 성공 메시지를 응답합니다.
    return res.status(200).json({
      code: 200,
      message: "User registered successfully.",
    });
  } catch (error) {
    // 등록이 실패하면 에러 메시지를 응답합니다.
    console.error("Failed to register user:", error);
    return res.status(500).json({
      code: 500,
      message: "Failed to register user.",
    });
  }
};


// data가 있으면 login

const login = async (req, res, next) => {
  const key = 'sk';
  // 받은 요청에서 db의 데이터를 가져온다 (로그인정보)

  console.log(req.body);
  // {
  //   user_id: "aaa",
  //   password: "aaa"
  // }

  const { email, password } = req.body

  const data = await db.runQuery(`SELECT * FROM users WHERE email = '${email}' and password = '${password}';`)
  console.log(data)
  if (data && data.length) {
    // 성공
    const user = data[0]

    // const user_id = "JY";
    const username = user.username;

    let token = "";
    console.log('eee');
    // jwt.sign(payload, secretOrPrivateKey, [options, callback])
    token = jwt.sign(
      {
        type: "JWT",
        user_id: user.user_id, // user에서 user_id
        email:email,
        username: username,
      },
      key,
      {
        expiresIn: "1000m", // 15분후 만료
        issuer: "토큰발급자",
      }
    );
    // response
    return res.status(200).json({
      code: 200,
      message: "token is created",
      token: token,
      user_id: user.user_id,
    });
  } else {
    // 실패
    return res.status(400).json({
      code: 400,
      message: "에러.",
    })
  }
};

// 미들웨어를 받아서 검증하는 엔드포인트 

const payload = async (req, res, next) => {
  if (!req.decoded) {
    return res.status(400).json({
      code: 400,
      message: "에러.",
    })
  }

  const user_id = req.decoded.user_id;
  const username = req.decoded.username;
  return res.status(200).json({
    code: 200,
    message: "토큰이 정상입니다.",
    data: {
      user_id: user_id,
      username: username,
    },
  });
};



// login 됐는지 확인, 쓰지말기
const check = async (req, res, next) => {
  if (!req.decoded) {
    return res.status(400).json({
      code: 400,
      message: "에러.",
    })
  }

  const user_id = req.decoded.user_id;
  try {
    const data = await runQuery(`SELECT * FROM users WHERE user_id = ${user_id};`)

    if(!data || !data.length) {
      throw new Error("no user")
    }
    const user = data[0]

    return res.status(200).json({
      code: 200,
      message: "토큰이 정상입니다.",
      data: user,
    });

  } catch (error) {
    console.log("failed to fetch.")
    return res.status(404).json({
      code: 404,
      message: "토큰이 정상적이지 않습니다."
    })
  }


};

const logout = async (req, res, next) => {
  try {
    // 로그아웃 시에는 특별히 처리할 내용이 없으므로, 단순히 응답을 보내기만 합니다.
    // 클라이언트 측에서는 로컬 스토리지나 쿠키 등에 저장된 토큰을 삭제하여 로그아웃을 완료합니다.
    return res.status(200).json({
      code: 200,
      message: "User logged out successfully.",
    });
  } catch (error) {
    // 로그아웃 과정에서 에러가 발생한 경우 에러 메시지를 응답합니다.
    console.error("Failed to logout:", error);
    return res.status(500).json({
      code: 500,
      message: "Failed to logout user.",
    });
  }
};


// 사용자의 몸무게 체중 근육량 등을 입력 받고 어떤 운동을 했는지와 식단을 기록할 수 있도록 구현.
const recordData = async (req, res, next) => {
  try {
    // 클라이언트로부터 받은 요청의 body에서 필요한 정보를 추출합니다.
    const { user_id, weight, muscle_mass, body_fat } = req.body;

    // 사용자의 데이터를 기록하기 위한 쿼리를 수정. 
    const query = 
   'UPDATE users SET weight=?, muscle_mass=?, body_fat=? WHERE user_id = ?';

    // 현재 시간을 생성합니다.
    const createdAt = new Date();

    // executeQuery 함수를 사용하여 쿼리를 실 행합니다.
    await db.executeQuery(query, [weight, muscle_mass, body_fat, user_id]);

    // 성공적으로 기록되었다는 메시지를 응답합니다.
    return res.status(200).json({
      code: 200,
      message: "User data recorded successfully.",
    });
  } catch (error) {
    // 데이터 기록 과정에서 에러가 발생한 경우 에러 메시지를 응답합니다.
    console.error("Failed to record user data:", error);
    return res.status(500).json({
      code: 500,
      message: "Failed to record user data.",
    });
  }
};

// 1. 트레이너 리스트 조회
const getTrainers = async (req, res, next) => {

  try {
    const query = `SELECT * FROM trainers`;
    const trainers = await db.executeQuery(query);
    return res.status(200).json({
      code: 200,
      message: "Trainer list retrieved successfully.",
      trainers: trainers,    
    });
  } catch (error) {
    console.error("Failed to retrieve trainer list:", error);
    return res.status(500).json({
      code: 500,
      message: "Failed to retrieve trainer list.",
    });
  }
};

// 2. 사용자가 트레이너를 선택해서 코칭 요청  
const requestCoaching = async (req, res, next) => {
  try {
  const user_id = req.decoded.user_id;

  const { trainer_id, comment } = req.body;
    const query = `INSERT INTO  trainer_interaction (user_id, trainer_id, interaction_date, interaction_type) VALUES (?, ?,?,?)`;
    const today = new Date()
    const interaction_type = 'coaching_request'

    const result = await db.executeQuery(query, [user_id, trainer_id, today, interaction_type]);
    const interaction_id = result.insertId; // 새로 생성된 interaction_id 가져오기

    // 코멘트를 추가로 저장
    if (comment) {
      const updateQuery = `UPDATE trainer_interaction SET comment = ? WHERE interaction_id = ? AND user_id = ?`;
      await db.executeQuery(updateQuery, [comment, interaction_id, user_id]);
    }
    
    return res.status(200).json({
      code: 200,
      message: "Coaching request sent successfully.",
      comment: comment || null, // 응답에 코멘트 포함
    });
  } catch (error) {
    console.error("Failed to send coaching request:", error);
    return res.status(500).json({
      code: 500,
      message: "Failed to send coaching request.",
    });
  }
};


// 2.5 트레이너가 자신에게 온 요청을 볼 수 있는 부분 
const getTrainerRequests = async (req, res, next) => {
  try {

    const trainer_id = req.decoded.user_id;

    // const { trainer_id } = req.params; // 트레이너의 ID를 요청에서 가져옵니다.

    // 특정 트레이너가 받은 요청을 조회하는 쿼리를 작성합니다.
    const query = `SELECT * FROM trainer_interaction WHERE trainer_id = ?`;

    // executeQuery 함수를 사용하여 쿼리를 실행하고 데이터를 가져옵니다.
    const requests = await db.executeQuery(query, [trainer_id]);

    // 요청이 성공적으로 조회되면 해당 정보를 응답합니다.
    return res.status(200).json({
      code: 200,
      message: "Trainer requests retrieved successfully.",
      requests: requests,
    });
  } catch (error) {
    // 조회 과정에서 에러가 발생한 경우 에러 메시지를 응답합니다.
    console.error("Failed to retrieve trainer requests:", error);
    return res.status(500).json({
      code: 500,
      message: "Failed to retrieve trainer requests.",
    });
  }
};




// 3. 트레이너가 요청 수락 - 트래이너가 접속해서 수락을 누른다.
const acceptRequest = async (req, res, next) => {
  try {
    const trainer_id = req.decoded.user_id;

    const { user_id } = req.body;
    const query = `UPDATE  trainer_interaction SET interaction_type = 'accepted' WHERE user_id = ? AND trainer_id = ?`;
    await db.executeQuery(query, [user_id, trainer_id]);
    return res.status(200).json({
      code: 200,
      message: "Coaching request accepted successfully.",
    });
  } catch (error) {
    console.error("Failed to accept coaching request:", error);
    return res.status(500).json({
      code: 500,
      message: "Failed to accept coaching request.",
    });
  }
};


// 4. 트레이너가 식단 등록, 속성들 전부 추가 // 기능 제외 
const registerDiet = async (req, res, next) => {
  try {
    const { trainer_id, diet_id,  } = req.body;
    const query = `INSERT INTO trainer_diets (trainer_id, diet_id) VALUES (?, ?)`;
    await db.executeQuery(query, [trainer_id, diet_id]);
    return res.status(200).json({
      code: 200,
      message: "Diet registered successfully.",
    });
  } catch (error) {
    console.error("Failed to register diet:", error);
    return res.status(500).json({
      code: 500,
      message: "Failed to register diet.",
    });
  }
};

// 트레이너와 회원간의 대화기능 구현 

// trainer_id 반환하는 함수 
const getTrainerIdByUserId = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    console.log("User ID:", user_id);  // user_id 출력

    if (!user_id) {
      return res.status(400).json({
        code: 400,
        message: "User ID is required.",
      });
    }

    // Step 1: Get username from users table using user_id
    const getUsernameQuery = `SELECT username FROM users WHERE user_id = ?`;
    const usernameResult = await db.executeQuery(getUsernameQuery, [user_id]);

    if (usernameResult && usernameResult.length > 0) {
      const username = usernameResult[0].username;

      // Step 2: Get trainer_id from trainers table using username
      const getTrainerIdQuery = `
        SELECT trainer_id
        FROM trainers
        WHERE trainer_name = ?
      `;
      const trainerIdResult = await db.executeQuery(getTrainerIdQuery, [username]);

      if (trainerIdResult && trainerIdResult.length > 0) {
        return res.status(200).json({
          code: 200,
          message: "Trainer ID retrieved successfully.",
          trainer_id: trainerIdResult[0].trainer_id,
        });
      } else {
        return res.status(404).json({
          code: 404,
          message: "Trainer not found for given username.",
        });
      }
    } else {
      return res.status(404).json({
        code: 404,
        message: "User not found for given user ID.",
      });
    }
  } catch (error) {
    console.error("Failed to retrieve trainer ID:", error);
    return res.status(500).json({
      code: 500,  
      message: "Failed to retrieve trainer ID.",
    });
  }
};




// 운동종목 유튜브 영상과 연결
const getVideoByExerciseId = async (req, res) => {
  const { exerciseId } = req.params;
  try {
    const query = 'SELECT youtube_link FROM youtube_links WHERE exercise_id = ?';
    const results = await db.executeQuery(query, [exerciseId]);
    if (results.length > 0) {
      return res.status(200).json({
        code: 200,
        success: true,
        message: "유튜브 링크를 성공적으로 가져왔습니다.",
        link: results[0].youtube_link
      });
    } else {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "지정된 운동종목에 대한 비디오 링크가 없습니다."
      });
    }
  } catch (error) {
    console.error('Error fetching video link:', error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "서버 오류가 발생했습니다."
    });
  }
};


// 알림 설정 저장 API
const setNotification = async (req, res, next) => {
  const { user_id, notification_time, enabled } = req.body;

  try {
    const query = 'UPDATE notifications SET notification_time = ?, enabled = ? WHERE user_id = ?';
    await db.executeQuery(query, [notification_time, enabled, user_id]);
    res.status(200).json({
      code: 200,
      message: "Notification settings updated successfully."
    });
  } catch (error) {
    console.error("Failed to update notification settings:", error);
    res.status(500).json({
      code: 500,
      message: "Failed to update notification settings."
    });
  }
};

// 알림 스케줄러 초기화
const initializeNotificationScheduler = async () => {
  try {
    const users = await db.runQuery('SELECT user_id, notification_time FROM notifications WHERE enabled = 1');
    users.forEach(user => {
      const [hour, minute] = user.notification_time.split(':');
      const scheduleTime = `${minute} ${hour} * * *`; // 매일 특정 시간에 실행

      schedule.scheduleJob(scheduleTime, function(){
        console.log(`Sending notification to user ${user.user_id}`);
        // 실제 알림 전송 로직 구현 (예: 이메일 or 푸시 알림)
      });
    });
  } catch (error) {
    console.error('Failed to initialize notification scheduler:', error);
  }
};

// 운동 기록을 조회하는 API
const getExercisesByUserId = async (req, res) => {
  const { userId } = req.params; // URL 경로에서 userId를 추출합니다.

  try {
      const query = `
          SELECT exercise_name, exercise_date, duration_minutes, calories_burned
          FROM exercises
          WHERE user_id = ?
          ORDER BY exercise_date DESC;
      `; // 특정 사용자의 운동 기록을 조회하는 쿼리

      const exercises = await db.executeQuery(query, [userId]); // 쿼리 실행

      if (exercises.length > 0) {
          res.status(200).json({
              code: 200,
              message: "Successfully queried exercise records.",
              data: exercises
          });
      } else {
          res.status(404).json({
              code: 404,
              message: "No exercise record."
          });
      }
  } catch (error) {
      console.error("Error checking exercise record.:", error);
      res.status(500).json({
          code: 500,
          message: "Failed to query exercise record due to server error."
      });
  }
};



module.exports = {
  register,
  login,
  check,
  logout,
  recordData,
  getTrainers,
  requestCoaching,
  acceptRequest,
  registerDiet,
  getVideoByExerciseId,
  setNotification,
  initializeNotificationScheduler,
  getExercisesByUserId,
  payload,
  getTrainerIdByUserId,
};
