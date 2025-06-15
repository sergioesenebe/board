const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 8001;
// Create a MySQL connection pool using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true // Prevent automatic conversion to Date objects
});
// Promisify pool to use async/await syntax (optional but recommended)
const db = pool.promise();
/*Show public data for HTML, CSS and JS*/
app.use(express.static('public'));
app.use(express.json());



/*Query for the login*/
app.post('/login', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { username, password } = req.body;
  // Validate that the necessary data is provided
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to verify if the user and password are correct
    const [results] = await db.query('SELECT * FROM users WHERE user_id = ? AND password = ?', [username, password]);


    // If the users are correct will return true
    if (results.length > 0) {
      return res.status(200).json({ success: true, message: "User logged in" });
    } else {
      return res.status(200).json({ success: false, message: 'Incorrect User or Password' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});

/*Query to check if username exists for signup*/
app.post('/checkUsername', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username from the body
  const { username } = req.body;
  // Validate that the necessary data is provided
  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to verify if the user exists
    const [results] = await db.query('SELECT * FROM users WHERE user_id = ?', [username])
    // If the username doesn't exist will return true
    if (results.length == 0) {
      return res.status(200).json({ success: true, message: "Username doesn't exists" });
    } else {
      return res.status(200).json({ success: false, message: 'Username already exists' });
    }
  }
  //Catch the error
  catch {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
/*Query to check if email exists for signup*/
app.post('/checkEmail', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the email from the body
  const { email } = req.body;
  // Validate that the necessary data is provided
  if (!email) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to check if there are an email
    const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    // If the email doesn't exist will return true
    if (results.length == 0) {
      return res.status(200).json({ success: true, message: 'Email not used' });
    } else {
      return res.status(200).json({ success: false, message: 'Email already in use' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});

/*Query to insert a new user for signup*/
app.post('/insertUser', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the first_name, second_name, username, email, password and avatar info from the body
  const { first_name, second_name, username, email, password, avatar } = req.body;
  // Validate that the necessary data is provided
  if (!first_name || !second_name || !username || !email || !password || !avatar) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Insert the user
    const [results] = await db.query('INSERT INTO `users`(`user_id`, `first_name`, `second_name`, `email`, `password`, `image_url`) VALUES (?,?,?,?,?,?)', [username, first_name, second_name, email, password, avatar])
    // If the user is inserted will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'User created' });
    } else {
      return res.status(200).json({ success: false, message: 'User not created' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });

  }
});
/*Query to get user first name*/
app.post('/getUserFirstName', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username from the body
  const { username } = req.body;
  // Validate that the necessary data is provided
  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to get the first name
    const [results] = await db.query('SELECT first_name FROM users WHERE user_id = ?', [username])
    // If the username exists will return the first name
    if (results.length > 0) {
      return res.status(200).json({ first_name: results[0].first_name });
    } else {
      return res.status(200).json({ success: false, message: 'Username not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
/*Query to get user avatar*/
app.post('/getAvatar', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username from the body
  const { username } = req.body;
  // Validate that the necessary data is provided
  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to show the image from user
    const [results] = await db.query('SELECT image_url FROM users WHERE user_id = ?', [username])
    // If the username exists and have an image will return the image
    if (results.length > 0) {
      return res.status(200).json({ image_url: results[0].image_url });
    } else {
      return res.status(200).json({ success: false, message: 'Avatar not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Query to show the boards of a user
app.post('/getBoards', async (req, res) => {
  // Takes the username from the body
  const { username } = req.body;
  // Validate that the necessary data is provided
  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to show the boards for user (order by last updated)
    const [results] = await db.query('SELECT board_id, name FROM boards WHERE user_id = ? ORDER BY last_updated DESC', [username])
    // If there are boards return them
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Boards not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });

  }
});
//Query to show the columns of a board
app.post('/getColumns', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the board id from the body
  const { boardId } = req.body;
  // Validate that the necessary data is provided
  if (!boardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to show the columns from a board
    const [results] = await db.query('SELECT column_id, name, `order` FROM `columns` WHERE board_id=? ORDER By `order`; ', [boardId]);
    // If there are columns return them
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Columns not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Query to show number of cards
app.post('/getCardsNumber', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the columnId and passwords from the body
  const { columnId } = req.body;
  // Validate that the necessary data is provided
  if (!columnId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to show the number of cards for a column
    const [results] = await db.query('SELECT count(*) AS number FROM `cards` WHERE column_id=?', [columnId]);
    // If there are cards return them
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Cards not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Query to show cards of a column
app.post('/getCards', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the column id
  const { columnId } = req.body;
  // Validate that the necessary data is provided
  if (!columnId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to show the number of cards for a column
    const [results] = await db.query('SELECT * FROM `cards` WHERE column_id=? ORDER By `order`', [columnId])
    // If there are cards return them
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Cards not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Query to show content of a card
app.post('/getCardContent', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the card
  const { cardId } = req.body;
  // Validate that the necessary data is provided
  if (!cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to show content from card
    const [results] = await db.query('SELECT content FROM `cards` WHERE card_id=?', [cardId]);
    // If the card has content return it
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Content not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Query to get a board id by a card
app.post('/getBoardByCard', async (req, res) => {
  // Takes the card id
  const { cardId } = req.body;
  //Return missing credentials if not card provided
  if (!cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to show board id from card
    const [results] = await db.query('SELECT board_id FROM `columns` WHERE column_id=(SELECT column_id FROM `cards` WHERE card_id=?); ', [cardId])
    // If the card has a board return it
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Board id not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});

//Query to show properties of a card
app.post('/getCardPropTypes', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the card id from the body
  const { cardId } = req.body;
  // Validate that the necessary data is provided
  if (!cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to show properties of a card
    const [results] = await db.query('SELECT PT.prop_type_id, PT.name AS prop_type_name, P.name AS property_name, P.property_id FROM card_prop_types CPT, prop_types PT, properties P WHERE CPT.prop_type_id=PT.prop_type_id AND PT.property_id=P.property_id AND CPT.card_id = ?; ', [cardId])
    // If there are properties return them
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Property types not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Query to show all properties and selected type
app.post('/getPropertiesAndTypes', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the card and board from the body
  const { cardId, boardId } = req.body;
  // Validate that the necessary data is provided
  if (!cardId || !boardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to show all properties of a board and card corresponding type
    const [results] = await db.query('SELECT P.name AS property_name, P.property_id AS property_id, COALESCE( MAX(CASE WHEN CPT.card_id IS NOT NULL THEN PT.name ELSE NULL END), NULL ) AS prop_type_name, COALESCE( MAX(CASE WHEN CPT.card_id IS NOT NULL THEN PT.prop_type_id ELSE NULL END), NULL ) AS prop_type_id FROM properties P LEFT JOIN prop_types PT ON P.property_id = PT.property_id LEFT JOIN card_prop_types CPT ON PT.prop_type_id = CPT.prop_type_id AND CPT.card_id = ? WHERE P.board_id = ? GROUP BY P.name, P.property_id; ', [cardId, boardId])
    // If there are properties return them
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Properties and types not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }

});
//Query to show all property Types of a card
app.post('/getPropTypes', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the property id from the body
  const { propertyId } = req.body;
  // Validate that the necessary data is provided
  if (!propertyId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to show properties of a card
    const [results] = await db.query('SELECT P.property_id, P.name AS property_name, PT.prop_type_id, PT.name AS prop_type_name FROM `properties` P, prop_types PT WHERE P.property_id = PT.property_id AND P.property_id=? ORDER BY prop_type_name', [propertyId]);
    // If there are properties return them
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Property Types not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Query to show the notes of a user
app.post('/getNotes', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username from the body
  const { username } = req.body;
  // Validate that the necessary data is provided
  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to get notes
    const [results] = await db.query('SELECT note_id, name, content FROM `notes` WHERE user_id=? ORDER BY last_updated DESC', [username])
    // If there is more than one note will return them
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Notes not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Query to show first event
app.post('/getUpcomingEvent', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username from the body
  const { username } = req.body;
  // Validate that the necessary data is provided
  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to show next event (ORDER BY end date)
    const [results] = await db.query('SELECT * FROM events WHERE end_date >= CURRENT_DATE AND user_id=? ORDER BY end_date LIMIT 1;', [username]);
    // If there is more than one event will return it
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'No Upcoming events' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});

//Query to show last used board last column
app.post('/getLastUsedBoardLastColumn', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username from the body
  const { username } = req.body;
  // Validate that the necessary data is provided
  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT last used board with columns order by ('order') from a user
    const [results] = await db.query('SELECT C.name, C.column_id, C.board_id FROM `columns` C, boards B WHERE B.board_id =(SELECT board_id FROM boards WHERE user_id=? ORDER BY last_updated DESC LIMIT 1) AND B.board_id = C.board_id ORDER BY `order` DESC;  ', [username])
    // If there is more than one column will return it
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'No User Board not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Query to get the board with the board_id
app.post('/getBoardById', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the board id from the body
  const { boardId } = req.body;
  // Validate that the necessary data is provided
  if (!boardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to get the board with the id
    const [results] = await db.query('SELECT * FROM `boards` WHERE board_id = ?;', [boardId])
    // If there is more than one note will return true
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Board not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Update Board Name
app.post('/updateBoardName', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the newName and board id from the body
  const { newName, boardId } = req.body;
  // Validate that the necessary data is provided
  if (!newName || !boardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Update the name of a board and the last_updated
    const [results] = await db.query('UPDATE boards SET name = ?,last_updated = NOW() WHERE board_id = ?;', [newName, boardId]);
    // If there is a change return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Board not found' });
    } else {
      return res.status(200).json({ success: false, message: 'Board not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Update Column Name
app.post('/updateColumnName', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the new name and column id from the body
  const { newName, columnId } = req.body;
  // Validate that the necessary data is provided
  if (!newName || !columnId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to show month events for a user
    const [results] = await db.query('UPDATE `columns` SET `name`=? WHERE `column_id`=?;', [newName, columnId]);
    console.log('Resultado de la segunda consulta:', results);
    // If it's inserted return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: false, message: 'Column name updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Column name not updated' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Update Card Name
app.post('/updateCardName', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the newname, card id and board id from the body
  const { newName, cardId } = req.body;
  // Validate that the necessary data is provided
  if (!newName || !cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // update card name
    const [results] = await db.query('UPDATE `cards` SET `name`=? WHERE `card_id`=?;', [newName, cardId]);
    console.log('Resultado de la segunda consulta:', results);
    // If there is a insertion return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: false, message: 'Card name updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Card name not updated' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});

//Update Column Order when move from left to right
app.post('/updateColumnOrderIncrease', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { columnId, newOrder } = req.body;
  // Validate that the necessary data is provided
  if (!columnId || isNaN(newOrder)) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Update the order of columns by decrementing the order of columns after the selected one
    const [results] = await db.query('UPDATE `columns` AS c  JOIN ( SELECT `order`,`board_id` FROM `columns` WHERE column_id = ? LIMIT 1 ) AS subquery ON c.`board_id` = subquery.`board_id` AND c.`order` <= ? AND c.`order` >= subquery.`order` SET c.`order` = c.`order` - 1;',[columnId, newOrder]);
    //Update column new order
    const [result] = await db.query('UPDATE `columns` SET `order`=? WHERE `column_id`=?;', [newOrder, columnId]);
    // If column order updated
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Column order updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Column order not updated' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the moved' });
  }
});
//Update Column Order when move from right to left
app.post('/updateColumnOrderDecrease', async (req, res) => {
  console.log('Body of the application:', req.body);

  // Get values from the request body
  const { columnId, newOrder } = req.body;
  // Validate that the necessary data is provided
  if (!columnId || isNaN(newOrder)) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Update the order of columns by incrementing the order of columns after the selected one
    const [results] = await db.query('UPDATE `columns` AS c JOIN (SELECT `order`, `board_id` FROM `columns` WHERE column_id = ? LIMIT 1) AS subquery ON c.`board_id` = subquery.`board_id` AND c.`order` <= subquery.`order` AND c.`order` >= ?  SET c.`order` = c.`order` + 1;', [columnId, newOrder]);
    // Now update the order of the selected column
    const [result] = await db.query('UPDATE `columns` SET `order` = ? WHERE `column_id` = ?;', [newOrder, columnId]);
    // Check if the update was successful
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Column order updated successfully', data: results });
    } else {
      return res.status(404).json({ success: false, message: 'Column order not updated' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the move' });
  }
});
//Update Card Order when move from bottom to top
app.post('/updateCardOrderIncrease', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the board id, card id and new order from the body
  const { cardId, newOrder } = req.body;

  if (!cardId || isNaN(newOrder)) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Update the order of cards by decrementing the order of cards after the selected one
    const [results] = await db.query('UPDATE `cards` AS c  JOIN ( SELECT `order`,`column_id` FROM `cards` WHERE card_id = ? LIMIT 1 ) AS subquery ON c.`column_id` = subquery.`column_id` AND c.`order` <= ? AND c.`order` >= subquery.`order` SET c.`order` = c.`order` - 1; ', [cardId, newOrder]);
    //Update card order
    const [result] = await db.query('UPDATE `cards` SET `order`=? WHERE `card_id`=?;', [newOrder, cardId]);
    console.log('Resultado de la segunda consulta:', results);
    // If there is more than one note will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Card order updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Card order not updated' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the moved' });

  }
});
//Update Card Order when move from right to left
app.post('/updateCardOrderDecrease', async (req, res) => {
  console.log('Body of the application:', req.body);

  // Get values from the request body
  const { cardId, newOrder } = req.body;
  // Validate that the necessary data is provided
  if (!cardId || isNaN(newOrder)) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Update the order of cards by incrementing the order of cards after the selected one
    const [results] = await db.query('UPDATE `cards` AS c JOIN (SELECT `order`, `column_id` FROM `cards` WHERE card_id = ? LIMIT 1) AS subquery ON c.`column_id` = subquery.`column_id` AND c.`order` <= subquery.`order` AND c.`order` >= ?  SET c.`order` = c.`order` + 1;', [cardId, newOrder]);
    // Now update the order of the selected column
    const [result] = await db.query('UPDATE `cards` SET `order` = ? WHERE `card_id` = ?;', [newOrder, cardId])
    // Check if the update was successful
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Card order updated successfully', data: results });
    } else {
      return res.status(404).json({ success: false, message: 'Card order not updated' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the move' });
  }
});
//Update card to other column and position
app.post('/updateCardDifferentColumn', async (req, res) => {
  console.log('Body of the application:', req.body);

  // Get values from the request body
  const { oldColumnId, newColumnId, cardId, newOrder } = req.body;
  // Validate that the necessary data is provided+
  if (!oldColumnId || !newColumnId || !cardId || isNaN(newOrder)) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Update cards order in column, dcecrement order in bigger order (wher it was)
    const [results] = await db.query('UPDATE `cards` AS c  JOIN ( SELECT `order`, `column_id` FROM `cards` WHERE card_id = ? LIMIT 1 ) AS subquery ON c.`column_id` = subquery.`column_id` AND c.`order` >= subquery.`order` SET c.`order` = c.`order` - 1;', [cardId]);
    //Update cards in future column, increment order in bigger order (where it will be)
    const [result] = await db.query('UPDATE `cards` SET `order`=`order` + 1 WHERE `order` >= ? AND column_id = ?; ', [newOrder, newColumnId]);
    //Update card column and order
    const [resul] = await db.query('UPDATE `cards` SET `order`=?, column_id = ? WHERE `card_id`=?;', [newOrder, newColumnId, cardId]);
    // If there is cahange will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Card order updated successfully' });
    } else {
      return res.status(200).json({ success: false, message: 'Card order not updated' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the moved 1' });
  }
});

//Insert Board
app.post('/insertBoard', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and newBoardName from the body
  const { newBoardName, username } = req.body;

  //Generate the column_id with UUID v4
  const { v4: uuidv4 } = require('uuid');
  const newBoardId = uuidv4();
  // Validate that the necessary data is provided
  if (!newBoardName || !newBoardId || !username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // INSERT new board with the id, user, name, and last_update (now)
    const [results] = await db.query('INSERT INTO `boards`(`board_id`, `user_id`, `name`, `last_updated`) VALUES (?,?,?,(SELECT NOW())); ', [newBoardId, username, newBoardName]);
    // If it is inserted correctly return the boardId
    if (results.affectedRows > 0) {
      return res.status(200).json({ boardId: newBoardId });
    } else {
      return res.status(200).json({ success: false, message: 'Board not inserted' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});

//Insert Column
app.post('/insertColumn', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the newColumnName and boardId from the body
  const { newColumnName, boardId } = req.body;

  //Generate the column_id with UUID v4
  const { v4: uuidv4 } = require('uuid');
  const newColumnId = uuidv4();
  // Validate that the necessary data is provided
  if (!newColumnName || !newColumnId || !boardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Insert a new column with the id, name and board ID
    const [results] = await db.query('INSERT INTO `columns`(`column_id`, `name`, `board_id`) VALUES (?,?,?);', [newColumnId, newColumnName, boardId]);
    // If it is inserted will return the data
    if (results.affectedRows > 0) {
      return res.status(200).json({ columnId: newColumnId, columnName: newColumnName, boardId: boardId });
    } else {
      return res.status(200).json({ success: false, message: 'Column not inserted' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Insert Card
app.post('/insertCard', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the newCardName and columnId from the body
  const { newCardName, columnId } = req.body;

  //Generate the card_id with UUID v4
  const { v4: uuidv4 } = require('uuid');
  const newCardId = uuidv4();
  // Validate that the necessary data is provided
  if (!newCardName || !newCardId || !columnId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Insert the card with the id, name and columnId
    const [results] = await db.query('INSERT INTO `cards`(`card_id`, `name`, `column_id`) VALUES (?,?,?);', [newCardId, newCardName, columnId]);
    // If it is inserted return the data of the card
    if (results.affectedRows > 0) {
      return res.status(200).json({ cardId: newCardId, cardName: newCardName, columnId: columnId });
    } else {
      return res.status(200).json({ success: false, message: 'Card not inserted' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Insert Property
app.post('/insertProperty', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the newPropertyName from the body
  const { newPropertyName, boardId } = req.body;

  //Generate the property_id with UUID v4
  const { v4: uuidv4 } = require('uuid');
  const newPropertyId = uuidv4();
  // Validate that the necessary data is provided
  if (!newPropertyName || !newPropertyId || !boardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // INSERT the property with the id, name and board Id
    const [results] = await db.query('INSERT INTO `properties`(`property_id`, `name`, `board_id`) VALUES (?,?,?);', [newPropertyId, newPropertyName, boardId]);
    // If it is inserted return the property data
    if (results.affectedRows > 0) {
      return res.status(200).json({ property_id: newPropertyId, property_name: newPropertyName, board_id: boardId });
    } else {
      return res.status(200).json({ success: false, message: 'Property not inserted' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Insert Property Type
app.post('/insertPropType', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the newPropTypeName, propertyId from the body
  const { newPropTypeName, propertyId } = req.body;

  //Generate the prop_type_id with UUID v4
  const { v4: uuidv4 } = require('uuid');
  const newPropTypeId = uuidv4();
  // Validate that the necessary data is provided
  if (!newPropTypeName || !newPropTypeId || !propertyId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Insert new prop type with the id, name and property id
    const [results] = await db.query('INSERT INTO `prop_types`(`prop_type_id`, `name`, `property_id`) VALUES (?,?,?)', [newPropTypeId, newPropTypeName, propertyId]);
    // If there is more than one note will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ prop_type_id: newPropTypeId, prop_type_name: newPropTypeName, property_id: propertyId });
    } else {
      return res.status(200).json({ success: false, message: 'Property not inserted' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});

//Remove Board
app.post('/deleteBoard', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username from the body
  const { boardId } = req.body;
  // Validate that the necessary data is provided
  if (!boardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Delete board with the id
    const [results] = await db.query('DELETE FROM `boards` WHERE board_id=?; ', [boardId]);
    // If it is deleted return the true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Board deleted' });
    } else {
      return res.status(200).json({ success: false, message: 'Board not deleted' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});

//Remove Column
app.post('/deleteColumn', async (req, res) => {
  // Takes the column id from the body
  const { columnId } = req.body;
  // Validate that the necessary data is provided
  if (!columnId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    //Move the columns to the left after the column
    const [results] = await db.query('UPDATE `columns` c JOIN (SELECT `order` FROM columns WHERE column_id = ? LIMIT 1) subquery ON c.`order` > subquery.`order` SET c.`order` = c.`order` - 1;', [columnId]);
    // Delete column with the id
    const [result] = await db.query('DELETE FROM `columns` WHERE column_id=?; ', [columnId])
    // If it is deleted return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Column deleted' });
    } else {
      return res.status(200).json({ success: false, message: 'Column not deleted' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Remove Card
app.post('/deleteCard', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the cardId and boardId from the body
  const { cardId } = req.body;
  // Validate that the necessary data is provided
  if (!cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    //Move the cards to the bottom after the column
    const [results] = await db.query('UPDATE `cards` c JOIN (SELECT `order`, `column_id` FROM cards WHERE card_id = ? LIMIT 1) subquery ON c.`order` > subquery.`order` AND c.column_id = subquery.`column_id` SET c.`order` = c.`order` - 1;', [cardId]);
    // Delete card with the id
    const [result] = await db.query('DELETE FROM `cards` WHERE card_id=?; ', [cardId]);
    // If it is deleted return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Card deleted' });
    } else {
      return res.status(200).json({ success: false, message: 'Card not deleted' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Remove Property
app.post('/deleteProperty', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the propertyId and boardId from the body
  const { propertyId } = req.body;
  // Validate that the necessary data is provided
  if (!propertyId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Delete property with the id
    const [results] = await db.query('DELETE FROM `properties` WHERE property_id=?; ', [propertyId]);
    // If it is deleted will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Property not deleted' });
    } else {
      return res.status(200).json({ success: false, message: 'Property not deleted' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Remove Property Type
app.post('/deletePropType', async (req, res) => {
  // Takes the propTypeId and boardId from the body
  const { propTypeId } = req.body;
  // Validate that the necessary data is provided
  if (!propTypeId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Delete property Type with the id
    const [results] = await db.query('DELETE FROM `prop_types` WHERE prop_type_id = ?; ', [propTypeId]);
    // If it is deleted will return the results
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: false, message: 'Prop Type deleted' });
    } else {
      return res.status(200).json({ success: false, message: 'Prop Type not deleted' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Remove Property Type for the card
app.post('/deletePropTypeCard', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the propTypeId, cardId and boardId from the body
  const { propTypeId, cardId } = req.body;
  // Validate that the necessary data is provided
  if (!propTypeId || !cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Delete property Type from the card with bouth ids
    const [results] = await db.query('DELETE FROM `card_prop_types` WHERE card_id=? AND prop_type_id=?; ', [cardId, propTypeId]);
    // If there is more than one note will return true
    if (results.affectedRows > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Prop Type not deleted from the card' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Get event from cards
app.post('/getEventFromCard', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the card id from the body
  const { cardId } = req.body;
  // Validate that the necessary data is provided
  if (!cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT the event for the card id
    const [results] = await db.query('SELECT E.start_date, E.end_date, E.event_id, E.name FROM `cards` C, `events` E WHERE C.card_id = E.card_id AND C.card_id= ? LIMIT 1;', [cardId]);
    // If the event doesn't exist will return false
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Event from card not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Insert an event
app.post('/insertEventUser', async (req, res) => {
  // Takes the username, eventName, startDate, endDate, cardId and boardId from the body
  const { username, eventName, startDate, endDate, cardId } = req.body;
  // Validate that the necessary data is provided
  if (!username || !eventName || !startDate || !endDate || !cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  //Generate the event_id with UUID v4
  const { v4: uuidv4 } = require('uuid');
  const eventId = uuidv4();
  try {
    // Insert the event with id, name, start and end date, card id and user id
    const [results] = await db.query('INSERT INTO `events`(`event_id`, `name`, `start_date`, `end_date`, `card_id`, `user_id`) VALUES (?,?,?,?,?,?);', [eventId, eventName, startDate, endDate, cardId, username]);
    // If it is inserted will return the event id
    if (results.affectedRows > 0) {
      return res.status(200).json({ eventId: eventId });
    } else {
      return res.status(200).json({ success: false, message: 'Event not inserted' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//update an event
app.post('/updateEventDate', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the startDate, endDate, eventId and boardId from the body
  const { startDate, endDate, eventId } = req.body;
  // Validate that the necessary data is provided
  if (!startDate || !endDate || !eventId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Update start and end dat for the event id
    const [results] = await db.query('UPDATE `events` SET `start_date`=?,`end_date`=? WHERE event_id=?;', [startDate, endDate, eventId]);
    // If it is updated will return the results
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Event not Updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Event not Updated' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});

//Update Card Content
app.post('/updateCardContent', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the cardId, content and boardId from the body
  const { cardId, content } = req.body;
  // Validate that the necessary data is provided
  if (!cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Update card content for the card id
    const [results] = await db.query('UPDATE `cards` SET `content`=? WHERE `card_id`=?;', [content, cardId]);
    // If it is updated will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Card Updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Card not Updated' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Query to insert Property Type for a property of a card
app.post('/insertCardPropertyType', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the propTypeId, cardId from the body
  const { propTypeId, cardId } = req.body;
  // Validate that the necessary data is provided
  if (!propTypeId || !cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // insert the relation between the card id and the prop_type_id
    const [results] = await db.query('INSERT INTO `card_prop_types`(`card_id`, `prop_type_id`) VALUES (?,?)', [cardId, propTypeId]);
    // If the username doesn't exist will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Property Type not updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Property Type not updated' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});

//Query to update Property Type for a property of a card
app.post('/updateCardPropertyType', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { oldPropTypeId, propTypeId, cardId } = req.body;
  // Validate that the necessary data is provided
  if (!oldPropTypeId || !propTypeId || !cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to show properties of a card
    const [results] = await db.query('UPDATE `card_prop_types` SET `prop_type_id`=? WHERE card_id = ? AND prop_type_id = ?', [propTypeId, cardId, oldPropTypeId]);
    // If the username doesn't exist will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Property Type updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Property Type not updated' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Query to update Property Name for a property of a card
app.post('/updatePropertyName', async (req, res) => {
  const { newName, propertyId } = req.body;
  // Validate that the necessary data is provided
  if (!newName || !propertyId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    //Update property name with id
    const [results] = await db.query('UPDATE `properties` SET `name`=? WHERE property_id = ?', [newName, propertyId]);
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Property updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Property not updated (no changes)' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error updating property:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Query to update Property Type Name
app.post('/updatePropTypeName', async (req, res) => {
  const { newName, propTypeId } = req.body;
  // Validate that the necessary data is provided
  if (!newName || !propTypeId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    //Update prop_type name with the id
    const [results] = await db.query('UPDATE `prop_types` SET `name`=? WHERE prop_type_id =?', [newName, propTypeId]);
    //Return result true if done
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Property Type updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Property Type not updated' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error updating property:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});

//--- Notes ---

//Insert Note
app.post('/insertNote', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and newBoardName from the body
  const { newNoteName, username } = req.body;

  //Generate the note_id with UUID v4
  const { v4: uuidv4 } = require('uuid');
  const newNoteId = uuidv4();
  // Validate that the necessary data is provided
  if (!newNoteName || !newNoteId || !username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // INSERT new note with the id, user, name amd last updated
    const [results] = await db.query('INSERT INTO `notes`(`note_id`, `name`, `user_id`, `last_updated`) VALUES (?,?,?,(SELECT NOW())); ', [newNoteId, newNoteName, username]);
    // If it is inserted correctly return the noteId
    if (results.affectedRows > 0) {
      return res.status(200).json({ noteId: newNoteId });
    } else {
      return res.status(200).json({ success: false, message: 'Note not inserted' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Query to get the note with the note_id
app.post('/getNoteById', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the note id from the body
  const { noteId } = req.body;
  // Validate that the necessary data is provided
  if (!noteId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to get the note with the id
    const [results] = await db.query('SELECT * FROM `notes` WHERE note_id = ?;', [noteId]);
    // If there is more than one note will return true
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Note not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Update Note Name
app.post('/updateNoteName', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the newName and board id from the bodyshow
  const { newName, noteId } = req.body;
  // Validate that the necessary data is provided
  if (!newName || !noteId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Update the name of a note and the last_updated
    const [results] = await db.query('UPDATE notes SET name = ?,last_updated = NOW() WHERE note_id = ?;', [newName, noteId]);
    // If there is a change return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Note name updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Note not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });

  }
});
//Remove Note
app.post('/deleteNote', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username from the body
  const { noteId } = req.body;
  // Validate that the necessary data is provided
  if (!noteId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Delete board with the id
    const [results] = await db.query('DELETE FROM `notes` WHERE note_id=?; ', [noteId]);
    // If it is deleted return the results
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Note deleted' });
    } else {
      return res.status(200).json({ success: false, message: 'Note not deleted' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });

  }
});
//Update Card Content
app.post('/updateNoteContent', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the cardId, content and boardId from the body
  const { noteId, content } = req.body;
  // Validate that the necessary data is provided
  if (!noteId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Update card content for the card id
    const [results] = await db.query('UPDATE `notes` SET `content`=? WHERE `note_id`=?;', [content, noteId]);
    // If it is updated will return the results
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Note content' });
    } else {
      return res.status(200).json({ success: false, message: 'Note content not Updated' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});

//--- Events ---

//Query to get events from a month
app.post('/getEventsByMonth', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username, month and year from the body
  const { username, month, year } = req.body;
  // Validate that the necessary data is provided
  if (!username || !month || !year) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to get the board with the id
    const [results] = await db.query('SELECT `event_id`, `name`, `start_date`, `end_date`, `card_id`, `location` FROM `events` WHERE user_id = ? AND MONTH(start_date) = ? AND YEAR(start_date) = ? ORDER BY start_date;', [username, month, year]);
    // If there is more than one note will return true
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'No events for this month' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });

  }
});
//Insert Event
app.post('/insertEvent', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the name, startDate and endDate from the body
  const { name, startDate, endDate, username } = req.body;
  //Generate the event_id with UUID v4
  const { v4: uuidv4 } = require('uuid');
  const eventId = uuidv4();
  // Validate that the necessary data is provided
  if (!name || !startDate || !endDate || !username || !eventId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // INSERT new event with the name, startDate, endDate, username
    const [results] = await db.query('INSERT INTO `events`(`event_id`, `name`, `start_date`, `end_date`, `user_id`) VALUES (?, ?, ?, ?, ?)', [eventId, name, startDate, endDate, username]);
    // If it is inserted correctly return the eventId
    if (results.affectedRows > 0) {
      return res.status(200).json({ eventId: eventId });
    } else {
      return res.status(200).json({ success: false, message: 'Event not inserted' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Remove Event
app.post('/deleteEvent', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the eventId from the body
  const { eventId } = req.body;
  // Validate that the necessary data is provided
  if (!eventId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Delete Event with the id
    const [results] = await db.query('DELETE FROM `events` WHERE event_id=?; ', [eventId]);
    // If it is deleted return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Event deleted' });
    } else {
      return res.status(200).json({ success: false, message: 'Event not deleted' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Update Event
app.post('/updateEvent', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the name, startDate, endDate, location an eventId from the body
  const { name, startDate, endDate, location, eventId } = req.body;
  // Validate that the necessary data is provided
  if (!name || !startDate || !endDate || !eventId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Update the name of a board and the last_updated
    const [results] = await db.query('UPDATE events SET name = ?, start_date = ?, end_date = ?, location = ? WHERE event_id = ?;', [name, startDate, endDate, location, eventId]);
    // If there is a change return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Event updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Event not updated' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});

//--- Settings ---
//Query to show the User with the id
app.post('/getUserFromUserId', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the board from the body
  const { userId } = req.body;
  // Validate that the necessary data is provided
  if (!userId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // SELECT to show the columns from a board
    const [results] = await db.query('SELECT * FROM `users` WHERE user_id=?; ', [userId]);
    // If the user exist return the results
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'User not found' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Update user data
app.post('/updateUser', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the firstName, secondName, newUsername, email, password and username from the body
  const { firstName, secondName, newUsername, email, username, avatar } = req.body;
  // Validate that the necessary data is provided
  if (!username || !firstName || !secondName || !newUsername || !email || !avatar) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Update the user with the id
    const [results] = await db.query('UPDATE `users` SET `user_id`=?,`first_name`=?,`second_name`=?,`email`=?,`image_url`=? WHERE `user_id` = ?;', [newUsername, firstName, secondName, email, avatar, username]);
    // If there is a change return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'User updated' });
    } else {
      return res.status(200).json({ success: false, message: 'User not updated' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});
//Update user password
app.post('/updateUserPassword', async (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the password and username from the body
  const { password, username } = req.body;
  // Validate that the necessary data is provided
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  try {
    // Update the user with the id
    const [results] = await db.query('UPDATE `users` SET `password`=? WHERE `user_id` = ?;', [password, username]);
    // If there is a change return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'User Password updated' });
    } else {
      return res.status(200).json({ success: false, message: 'User Password not updated' });
    }
  }
  //Catch the error
  catch (error) {
    console.error('Error in the query:', error);
    return res.status(500).json({ success: false, message: 'Error in the Database' });
  }
});



/*Open port*/
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening in http://localhost:${port}`);
});
