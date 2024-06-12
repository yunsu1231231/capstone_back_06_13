const db = require('../../lib/db');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const multer = require('multer');

dotenv.config(); // Ensuring environment variables are loaded


  
// 클라이언트로부터 받은 데이터를 사용하여 데이터베이스에 새로운 "게시물"을 생성하고, 생성된 게시물의 정보를 JSON 응답으로 보내는 역할
const createPost = async (req, res) => {
    const { title, content } = req.body;
    console.log(req.file);
    const photo_url = req.file ? req.file.path : null;  // 파일 경로 추출
    console.log(photo_url);

    const user_id = req.decoded.user_id;
    

    try {
        let results;
        if(photo_url){
            const query = 'INSERT INTO posts (title, content, user_id, photo_url) VALUES (?,?,?,?)'

            results = await db.executeQuery(query, [title, content, user_id, photo_url]);
        }
        else{
            const query = 'INSERT INTO posts (title, content, user_id) VALUES (?,?,?)'

            results = await db.executeQuery(query, [title, content, user_id]);
        }

        res.status(201).json({ id: results.insertId, title, content, user_id, photo_url });

    } catch (err) {
        res.status(409).json({ message: err.message });
    }
};

  


// 특정 ID를 가진 "게시물"의 정보를 업데이트하고, 업데이트된 결과를 JSON 응답으로 보내는 역할
const updatePost = async (req, res) => {
    const { post_id, title, content } = req.body;

    const user_id = req.decoded.user_id;

    try {
        const query = 'UPDATE posts SET title = ?, content = ? user_id = ? WHERE post_id = ?';
        const result = await db.executeQuery(query, [title, content,user_id, post_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No post found with that post_id" });
        }

        res.json({
            code: 200,
            message: "Post updated successfully",
            data: { post_id, title, content }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};




// 특정 ID를 가진 "게시물"을 데이터베이스에서 삭제하고, 성공 메시지를 JSON 응답으로 보내는 역할
const deletePost = async (req, res) => {

const user_id = req.decoded.user_id;

const { post_id } = req.body;

  if (!post_id) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  try {
    const query = 'DELETE posts FROM SET user_id = ? WHERE post_id = ?';
    const result = await db.executeQuery(query, [user_id,post_id]);


    if (result.affectedRows === 0) {
      // 삭제할 게시물이 없는 경우
      return res.status(404).json({ message: "No post found with that ID" });
    }

    // 성공적으로 게시물 삭제
    res.json({
      message: "Post deleted successfully",
      post_id: post_id
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
}


// 특정 ID의 "게시물"에 대한 좋아요 기능을 구현해야 하며, 이 기능의 구현이 필요함을 알리는 JSON 응답을 보내는 역할
const likePost = async (req, res) => {
    const {post_id} = req.body;

    const user_id = req.decoded.user_id;// user_id 받기 

    console.log("likePost", post_id, user_id)

    try {
        // 게시물의 좋아요 정보를 조회합니다.
        const query_1 = 'SELECT likes FROM posts WHERE user_id = ? AND post_id = ?';
        const post = await db.executeQuery(query_1, [user_id, post_id]);

        if (post.length === 0) {
            return res.status(404).send("Post not found");
        }

        // 좋아요 배열을 처리합니다.
        let likes = post[0].likes ? post[0].likes.split(',') : [];
        const index = likes.indexOf(String(user_id));

        if (index === -1) {
            // 사용자 ID가 좋아요 목록에 없다면 추가
            likes.push(user_id);
        } else {
            likes = likes.filter(user_id => user_id !== String(user_id));
            // 사용자 ID가 좋아요 목록에 있다면 제거
        }

        // 데이터베이스에 좋아요 목록을 업데이트합니다.
        const query_2 = 'UPDATE posts SET likes = ? WHERE post_id = ?';
        await db.executeQuery(query_2, [likes.join(','), post_id]);

        // 업데이트된 게시물 정보를 조회합니다.
        const query_3 = 'SELECT * FROM posts WHERE post_id = ?';
        const updatedPost = await db.executeQuery(query_3, [post_id]);

        // 클라이언트에게 업데이트된 게시물 정보를 반환합니다.
        res.json({
            ...updatedPost[0],
            like_count: likes.length
        });
    } catch (err) {
        console.error("Error processing like:", err);
        res.status(500).send("An error occurred");
    }
};



//  사용자가 자신의 인스타그램 계정과 게시물을 연동할 수 있게 하는 함수

const instagramtag = async (req, res) => {
    try {
        // 클라이언트로부터 받은 요청의 body에서 필요한 정보를 추출합니다.
        const { user_id, post_id, instagram_tag } = req.body;

        // 입력 값 검증
        if (!user_id || !post_id || !instagram_tag) {
            return res.status(400).json({
                code: 400,
                message: "Missing required fields: user_id, post_id, or instagram_tag."
            });
        }

        // 인스타그램 태그를 저장하거나 업데이트하기 위한 쿼리
        const query = 'UPDATE posts SET instagram_tag = ? WHERE post_id = ? AND user_id = ?';

        // executeQuery 함수를 사용하여 쿼리를 실행합니다.
        const result = await db.executeQuery(query, [instagram_tag, post_id, user_id]);

        // 업데이트된 행이 없을 경우, 적절한 메시지 응답
        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: "No post found with that ID or unauthorized access."
            });
        }

        // 성공적으로 인스타그램 태그를 저장하였다는 메시지를 응답합니다.
        return res.status(200).json({
            code: 200,
            message: "Instagram tag updated successfully."
        });
    } catch (error) {
        // 데이터베이스 쿼리 실행 중 에러가 발생한 경우 에러 메시지를 응답합니다.
        console.error("Failed to update Instagram tag:", error);
        return res.status(500).json({
            code: 500,
            message: "Failed to update Instagram tag."
        });
    }
};


// , 데이터베이스에서 게시물 목록을 페이징하여 조회하고 반환
const listPosts = async (req, res, next) => {
    // 페이지 번호와 페이지 크기(페이지당 항목 수)를 쿼리 매개변수로부터 받습니다.
    const page = parseInt(req.query.page) || 1; // 기본값은 1
    const limit = parseInt(req.query.limit) || 10; // 기본값은 10
    const { search } = req.query;

    
    // 계산된 offset
    const offset = (page - 1) * limit;


    console.log(page);
    console.log(limit);
    console.log(offset);


    try {
        // 게시물과 해당 게시물의 총 수를 동시에 조회
        let postQuery = `SELECT * FROM posts ORDER BY post_id DESC limit ${offset},${limit}`;
        
        if (search) {
            postQuery = `SELECT * FROM posts WHERE title LIKE '${search}' ORDER BY post_id DESC limit ${offset},${limit}`;
        }
        
        const countQuery = 'SELECT COUNT(*) as count FROM posts';

        // 데이터베이스 쿼리 실행
        
        const posts = await db.runQuery(postQuery);
        const total = await db.runQuery(countQuery);
        

        //const posts = await db.executeQuery(postQuery);
        //const total = await db.executeQuery(countQuery);


        // 총 페이지 수 계산
        const totalPages = Math.ceil(total[0].count / limit);

        // 응답 반환
        return res.status(200).json({
            code: 200,
            message: "Posts fetched successfully.",
            data: {
                totalItems: total[0].count,
                totalPages: totalPages,
                currentPage: page,
                pageSize: posts.length,
                posts: posts
            }
        });
    } catch (error) {
        // 에러 발생 시 에러 메시지 응답
        console.error("Failed to fetch posts:", error);
        return res.status(500).json({
            code: 500,
            message: "Internal server error."
        });
    }
};


// 사용 x
const searchPosts = async (req, res) => {
    // 사용자가 입력한 검색어를 쿼리 매개변수로부터 받습니다.
    const { search } = req.query;

    // 검색어 입력 여부 확인
    if (!search) {
        return res.status(400).json({
            code: 400,
            message: "Search term is required."
        });
    }

    try {
        // 검색어를 포함하는 게시물 조회
        const query = 'SELECT * FROM posts WHERE title LIKE ? ORDER BY post_id DESC';
        const searchTerm = `%${search}%`; // SQL LIKE 검색을 위한 검색어 포맷팅

        // 데이터베이스 쿼리 실행
        const posts = await db.executeQuery(query, [searchTerm]);

        // 결과 반환
        if (posts.length === 0) {
            return res.status(404).json({
                code: 404,
                message: "No posts found matching your criteria."
            });
        }

        res.status(200).json({
            code: 200,
            message: "Posts fetched successfully.",
            data: posts
        });
    } catch (error) {
        console.error("Failed to search posts:", error);
        res.status(500).json({
            code: 500,
            message: "Internal server error."
        });
    }
};


const comment = async (req, res) => {
    // 클라이언트로부터 받은 요청의 body에서 필요한 정보를 추출합니다.
    const {post_id, content } = req.body;

    const user_id = req.decoded.user_id;
    
    // 필수 입력 값 검증
    if (!user_id || !post_id || !content) {
        return res.status(400).json({
            code: 400,
            message: "Missing required fields: user_id, post_id, or content."
        });
    }

    try {
        // 댓글 데이터를 데이터베이스에 저장하기 위한 쿼리
        const query = 'INSERT INTO comments (user_id, post_id, content, created_at) VALUES (?, ?, ?, NOW())';

        // 데이터베이스 쿼리 실행
        const result = await db.executeQuery(query, [user_id, post_id, content]);

        // 성공적으로 댓글을 저장했다는 메시지를 응답합니다.
        res.status(201).json({
            code: 201,
            message: "Comment posted successfully.",
            commentId: result.insertId // 삽입된 댓글의 ID 반환
        });
    } catch (error) {
        console.error("Failed to post comment:", error);
        res.status(500).json({
            code: 500,
            message: "Internal server error."
        });
    }
};

const getcomment = async (req, res) => {
    // 클라이언트로부터 받은 요청의 body에서 필요한 정보를 추출합니다.

    const { post_id } = req.query;

    console.log(post_id);


    const user_id = req.decoded.user_id;
    
    try {
        // 댓글 데이터를 데이터베이스에 저장하기 위한 쿼리
        const query = 'SELECT * FROM comments WHERE post_id = ?';

        // 데이터베이스 쿼리 실행
        const result = await db.executeQuery(query, [post_id]);

        // 성공적으로 댓글을 저장했다는 메시지를 응답합니다.
        res.status(201).json({
            code: 201,
            data:result 
        });

    } catch (error) {
        console.error("Failed to post comment:", error);
        res.status(500).json({
            code: 500,
            message: "Internal server error."
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
      // 인증된 사용자 ID를 가져옵니다. 
      const user_id = req.decoded.user_id;
  
      // 사용자 정보를 가져오는 쿼리를 작성합니다.
        const query = 'SELECT username, email FROM users WHERE user_id = ?';
        const user = await db.executeQuery(query, [user_id]); // query문에 대한 이해도,, 둘 다 받는것인지 
  
      if (user.length === 0) {
        return res.status(404).json({
          code: 404,
          message: "User not found",
        });
      }
  
      // 사용자 정보를 응답합니다.
      return res.status(200).json({
        code: 200,
        data: user[0],
      });
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      return res.status(500).json({
        code: 500,
        message: "Failed to fetch user profile.",
      });
    }
  };

  const record = async (req, res) => {
    try {
      const {date, exercise, count1, count2 } = req.body;

      const user_id = req.decoded.user_id;

  
      const query = `INSERT INTO exercises (date, exercise, count1, count2, user_id) VALUES (?, ?, ?, ?, ?)`;
      await db.executeQuery(query, [date, exercise, count1, count2, user_id]);
  
      return res.status(200).json({
        code: 200,
        message: "Exercise log saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save exercise log:", error);
      return res.status(500).json({
        code: 500,
        message: "Failed to save exercise log.",
      });
    }
  };
  
  // 사용자 운동 기록 불러오기 API
  const getrecord = async (req, res) => {
    try {

        const user_id = req.decoded.user_id;
  
        const query = `SELECT date, exercise, count1, count2, user_id FROM exercises WHERE user_id = ?`;
        const logs = await db.executeQuery(query, [user_id]);

        console.log(logs)
  
      return res.status(200).json({
        code: 200,
        data: logs,
      });
    } catch (error) {
      console.error("Failed to fetch exercise logs:", error);
      return res.status(500).json({
        code: 500,
        message: "Failed to fetch exercise logs.",
      });
    }
  };


  const getPhoto = async (req, res) => {
    const { photoId } = req.params;
    
    try {
        const query = 'SELECT photo_url FROM posts WHERE id = ?';
        const results = await db.executeQuery(query, [photoId]);

        if (results.length > 0) {
            const photo_url = results[0].photo_url;
            if (photo_url) {
                res.sendFile(photo_url, { root: '.' }); // 루트 디렉터리를 기준으로 파일 경로를 설정
            } else {
                res.status(404).json({ message: 'Photo not found' });
            }
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



/*
// 사용자의 활동량(예: 운동한 일수)에 따라 등급을 나누고, 이 등급을 사용자 프로필 옆에 표시하는 기능
const grade = async (req, res, next) => {
    // 내용 
}; 
*/


module.exports = {
    getcomment,
    createPost,
    updatePost,
    deletePost,
    likePost,
    searchPosts,
    comment,
    instagramtag,
    listPosts,
    searchPosts,
    getUserProfile,
    record,
    getrecord,
    getPhoto,
};