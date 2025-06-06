const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 8001;
/*Save conexion variable with mysql thanks to environment variables*/
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  dateStrings: true //Evit convert to string
});
/*Connect to mySQL*/
db.connect(err => {
  if (err) {
    console.error('MySQL conexion error:', err);
    return;
  }
  console.log('Connected to MySQL');
});
/*Show public data for HTML, CSS and JS*/
app.use(express.static('public'));
app.use(express.json());



/*Query for the login*/
app.post('/login', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { username, password } = req.body;
  // Validate that the necessary data is provided
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to verify if the user and password are correct
  db.query('SELECT * FROM users WHERE user_id = ? AND password = ?', [username, password], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the users are correct will return true
    if (results.length > 0) {
      return res.status(200).json({ success: true, message: "User logged in" });
    } else {
      return res.status(200).json({ success: false, message: 'Incorrect User or Password' });
    }
  });
});

/*Query to check if username exists for signup*/
app.post('/checkUsername', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username from the body
  const { username } = req.body;
  // Validate that the necessary data is provided
  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to verify if the user exists
  db.query('SELECT * FROM users WHERE user_id = ?', [username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the username doesn't exist will return true
    if (results.length == 0) {
      return res.status(200).json({ success: true, message: "Username doesn't exists" });
    } else {
      return res.status(200).json({ success: false, message: 'Username already exists' });
    }
  });
});
/*Query to check if email exists for signup*/
app.post('/checkEmail', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the email from the body
  const { email } = req.body;
  // Validate that the necessary data is provided
  if (!email) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to check if there are an email
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the email doesn't exist will return true
    if (results.length == 0) {
      return res.status(200).json({ success: true, message: 'Email not used' });
    } else {
      return res.status(200).json({ success: false, message: 'Email already in use' });
    }
  });
});

/*Query to insert a new user for signup*/
app.post('/insertUser', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the first_name, second_name, username, email, password and avatar info from the body
  const { first_name, second_name, username, email, password, avatar } = req.body;
  // Validate that the necessary data is provided
  if (!first_name || !second_name || !username || !email || !password || !avatar) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Insert the user
  db.query('INSERT INTO `users`(`user_id`, `first_name`, `second_name`, `email`, `password`, `image_url`) VALUES (?,?,?,?,?,?)', [username, first_name, second_name, email, password, avatar], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the user is inserted will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'User created' });
    } else {
      return res.status(200).json({ success: false, message: 'User not created' });
    }

  });
});
/*Query to get user first name*/
app.post('/getUserFirstName', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username from the body
  const { username } = req.body;
  // Validate that the necessary data is provided
  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to get the first name
  db.query('SELECT first_name FROM users WHERE user_id = ?', [username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the username exists will return the first name
    if (results.length > 0) {
      return res.status(200).json({ first_name: results[0].first_name });
    } else {
      return res.status(200).json({ success: false, message: 'Username not found' });
    }
  });
});
/*Query to get user avatar*/
app.post('/getAvatar', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username from the body
  const { username } = req.body;
  // Validate that the necessary data is provided
  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show the image from user
  db.query('SELECT image_url FROM users WHERE user_id = ?', [username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the username exists and have an image will return the image
    if (results.length > 0) {
      return res.status(200).json({ image_url: results[0].image_url });
    } else {
      return res.status(200).json({ success: false, message: 'Avatar not found' });
    }
  });
});
//Query to show the boards of a user
app.post('/getBoards', (req, res) => {
  // Takes the username from the body
  const { username } = req.body;
  // Validate that the necessary data is provided
  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show the boards for user (order by last updated)
  db.query('SELECT board_id, name FROM boards WHERE user_id = ? ORDER BY last_updated DESC', [username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there are boards return them
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Boards not found' });
    }
  });
});
//Query to show the columns of a board
app.post('/getColumns', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the board id from the body
  const { boardId } = req.body;
  // Validate that the necessary data is provided
  if (!boardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show the columns from a board
  db.query('SELECT column_id, name, `order` FROM `columns` WHERE board_id=? ORDER By `order`; ', [boardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there are columns return them
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Columns not found' });
    }
  });
});
//Query to show number of cards
app.post('/getCardsNumber', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the columnId and passwords from the body
  const { columnId } = req.body;
  // Validate that the necessary data is provided
  if (!columnId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show the number of cards for a column
  db.query('SELECT count(*) AS number FROM `cards` WHERE column_id=?', [columnId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there are cards return them
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Cards not found' });
    }
  });
});
//Query to show cards of a column
app.post('/getCards', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the column id
  const { columnId } = req.body;
  // Validate that the necessary data is provided
  if (!columnId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show the number of cards for a column
  db.query('SELECT * FROM `cards` WHERE column_id=? ORDER By `order`', [columnId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there are cards return them
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Cards not found' });
    }
  });
});
//Query to show content of a card
app.post('/getCardContent', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the card
  const { cardId } = req.body;
  // Validate that the necessary data is provided
  if (!cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show content from card
  db.query('SELECT content FROM `cards` WHERE card_id=?', [cardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the card has content return it
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Content not found' });
    }
  });
});
//Query to get a board id by a card
app.post('/getBoardByCard', (req, res) => {
  // Takes the card id
  const { cardId } = req.body;
  //Return missing credentials if not card provided
  if (!cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  // SELECT to show board id from card
  db.query('SELECT board_id FROM `columns` WHERE column_id=(SELECT column_id FROM `cards` WHERE card_id=?); ', [cardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the card has a board return it
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Board id not found' });
    }
  });
});

//Query to show properties of a card
app.post('/getCardPropTypes', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the card id from the body
  const { cardId } = req.body;
  // Validate that the necessary data is provided
  if (!cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show properties of a card
  db.query('SELECT PT.prop_type_id, PT.name AS prop_type_name, P.name AS property_name, P.property_id FROM card_prop_types CPT, prop_types PT, properties P WHERE CPT.prop_type_id=PT.prop_type_id AND PT.property_id=P.property_id AND CPT.card_id = ?; ', [cardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there are properties return them
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Property types not found' });
    }
  });
});
//Query to show all properties and selected type
app.post('/getPropertiesAndTypes', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the card and board from the body
  const { cardId, boardId } = req.body;
  // Validate that the necessary data is provided
  if (!cardId || !boardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  // SELECT to show all properties of a board and card corresponding type
  db.query('SELECT P.name AS property_name, P.property_id AS property_id, COALESCE( MAX(CASE WHEN CPT.card_id IS NOT NULL THEN PT.name ELSE NULL END), NULL ) AS prop_type_name, COALESCE( MAX(CASE WHEN CPT.card_id IS NOT NULL THEN PT.prop_type_id ELSE NULL END), NULL ) AS prop_type_id FROM properties P LEFT JOIN prop_types PT ON P.property_id = PT.property_id LEFT JOIN card_prop_types CPT ON PT.prop_type_id = CPT.prop_type_id AND CPT.card_id = ? WHERE P.board_id = ? GROUP BY P.name, P.property_id; ', [cardId, boardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If there are properties return them
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Properties and types not found' });
    }
  });
});
//Query to show all property Types of a card
app.post('/getPropTypes', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the property id from the body
  const { propertyId } = req.body;
  // Validate that the necessary data is provided
  if (!propertyId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  // SELECT to show properties of a card
  db.query('SELECT P.property_id, P.name AS property_name, PT.prop_type_id, PT.name AS prop_type_name FROM `properties` P, prop_types PT WHERE P.property_id = PT.property_id AND P.property_id=? ORDER BY prop_type_name', [propertyId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there are properties return them
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Property Types not found' });
    }
  });
});
//Query to show the notes of a user
app.post('/getNotes', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username from the body
  const { username } = req.body;
  // Validate that the necessary data is provided
  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to get notes
  db.query('SELECT note_id, name, content FROM `notes` WHERE user_id=? ORDER BY last_updated DESC', [username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is more than one note will return them
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Notes not found' });
    }
  });
});
//Query to show first event
app.post('/getUpcomingEvent', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username from the body
  const { username } = req.body;
  // Validate that the necessary data is provided
  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show next event (ORDER BY end date)
  db.query('SELECT * FROM events WHERE end_date >= CURRENT_DATE AND user_id=? ORDER BY end_date LIMIT 1;', [username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is more than one event will return it
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'No Upcoming events' });
    }
  });
});

//Query to show last used board last column
app.post('/getLastUsedBoardLastColumn', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username from the body
  const { username } = req.body;
  // Validate that the necessary data is provided
  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT last used board with columns order by ('order') from a user
  db.query('SELECT C.name, C.column_id, C.board_id FROM `columns` C, boards B WHERE B.board_id =(SELECT board_id FROM boards WHERE user_id=? ORDER BY last_updated DESC LIMIT 1) AND B.board_id = C.board_id ORDER BY `order` DESC;  ', [username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is more than one column will return it
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'No User Board not found' });
    }
  });
});
//Query to get the board with the board_id
app.post('/getBoardById', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the board id from the body
  const { boardId } = req.body;
  // Validate that the necessary data is provided
  if (!boardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to get the board with the id
  db.query('SELECT * FROM `boards` WHERE board_id = ?;', [boardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is more than one note will return true
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Board not found' });
    }
  });
});
//Update Board Name
app.post('/updateBoardName', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the newName and board id from the body
  const { newName, boardId } = req.body;
  // Validate that the necessary data is provided
  if (!newName || !boardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Update the name of a board and the last_updated
  db.query('UPDATE boards SET name = ?,last_updated = NOW() WHERE board_id = ?;', [newName, boardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is a change return true
    if (results.affectedRows > 0) {
      return res.status(200).json({success: true, message: 'Board not found'});
    } else {
      return res.status(200).json({ success: false, message: 'Board not found' });
    }
  });
});
//Update Column Name
app.post('/updateColumnName', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the new name and column id from the body
  const { newName, columnId } = req.body;
  // Validate that the necessary data is provided
  if (!newName || !columnId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show month events for a user
  db.query('UPDATE `columns` SET `name`=? WHERE `column_id`=?;', [newName, columnId], (err, results) => {
    console.log('Resultado de la segunda consulta:', results);

    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If it's inserted return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: false, message: 'Column name updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Column name not updated' });
    }
  });

});
//Update Card Name
app.post('/updateCardName', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the newname, card id and board id from the body
  const { newName, cardId } = req.body;
  // Validate that the necessary data is provided
  if (!newName || !cardId ) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // update card name
  db.query('UPDATE `cards` SET `name`=? WHERE `card_id`=?;', [newName, cardId], (err, results) => {
    console.log('Resultado de la segunda consulta:', results);

    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is a insertion return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: false, message: 'Card name updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Card name not updated' });
    }
  });

});

//Update Column Order when move from left to right
app.post('/updateColumnOrderIncrease', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { columnId, newOrder } = req.body;
  // Validate that the necessary data is provided
  if (!columnId || isNaN(newOrder)) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Update the order of columns by decrementing the order of columns after the selected one
  db.query('UPDATE `columns` AS c  JOIN ( SELECT `order`,`board_id` FROM `columns` WHERE column_id = ? LIMIT 1 ) AS subquery ON c.`board_id` = subquery.`board_id` AND c.`order` <= ? AND c.`order` >= subquery.`order` SET c.`order` = c.`order` - 1; ', [columnId, newOrder], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the moved' });
    }
    //Update column new order
    db.query('UPDATE `columns` SET `order`=? WHERE `column_id`=?;', [newOrder, columnId], (err, results) => {
      console.log('Resultado de la segunda consulta:', results);
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error in the dragging' });
      }
    })
    // If column order updated
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Column order updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Column order not updated' });
    }
  });

});
//Update Column Order when move from right to left
app.post('/updateColumnOrderDecrease', (req, res) => {
  console.log('Body of the application:', req.body);

  // Get values from the request body
  const { columnId, newOrder } = req.body;
  // Validate that the necessary data is provided
  if (!columnId || isNaN(newOrder)) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Update the order of columns by incrementing the order of columns after the selected one
  db.query('UPDATE `columns` AS c JOIN (SELECT `order`, `board_id` FROM `columns` WHERE column_id = ? LIMIT 1) AS subquery ON c.`board_id` = subquery.`board_id` AND c.`order` <= subquery.`order` AND c.`order` >= ?  SET c.`order` = c.`order` + 1;', [columnId, newOrder], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the move' });
    }

    // Now update the order of the selected column
    db.query('UPDATE `columns` SET `order` = ? WHERE `column_id` = ?;', [newOrder, columnId], (err, results) => {
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error in the dragging' });
      }
      // Check if the update was successful
      if (results.affectedRows > 0) {
        return res.status(200).json({ success: true, message: 'Column order updated successfully', data: results });
      } else {
        return res.status(404).json({ success: false, message: 'Column order not updated' });
      }
    });
  });
});
//Update Card Order when move from bottom to top
app.post('/updateCardOrderIncrease', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the board id, card id and new order from the body
  const { cardId, newOrder } = req.body;

  if ( !cardId || isNaN(newOrder)) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  // Update the order of cards by decrementing the order of cards after the selected one
  db.query('UPDATE `cards` AS c  JOIN ( SELECT `order`,`column_id` FROM `cards` WHERE card_id = ? LIMIT 1 ) AS subquery ON c.`column_id` = subquery.`column_id` AND c.`order` <= ? AND c.`order` >= subquery.`order` SET c.`order` = c.`order` - 1; ', [cardId, newOrder], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the moved' });
    }
    //Update card order
    db.query('UPDATE `cards` SET `order`=? WHERE `card_id`=?;', [newOrder, cardId], (err, results) => {
      console.log('Resultado de la segunda consulta:', results);
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error in the dragging' });
      }
    })

    // If there is more than one note will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Card order updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Card order not updated' });
    }
  });
});
//Update Card Order when move from right to left
app.post('/updateCardOrderDecrease', (req, res) => {
  console.log('Body of the application:', req.body);

  // Get values from the request body
  const { cardId, newOrder } = req.body;
  // Validate that the necessary data is provided
  if ( !cardId || isNaN(newOrder)) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  // Update the order of cards by incrementing the order of cards after the selected one
  db.query('UPDATE `cards` AS c JOIN (SELECT `order`, `column_id` FROM `cards` WHERE card_id = ? LIMIT 1) AS subquery ON c.`column_id` = subquery.`column_id` AND c.`order` <= subquery.`order` AND c.`order` >= ?  SET c.`order` = c.`order` + 1;', [cardId, newOrder], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the move' });
    }

    // Now update the order of the selected column
    db.query('UPDATE `cards` SET `order` = ? WHERE `card_id` = ?;', [newOrder, cardId], (err, results) => {
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error in the dragging' });
      }

      // Check if the update was successful
      if (results.affectedRows > 0) {
        return res.status(200).json({ success: true, message: 'Card order updated successfully', data: results });
      } else {
        return res.status(404).json({ success: false, message: 'Card order not updated' });
      }
    });
  });

});
//Update card to other column and position
app.post('/updateCardDifferentColumn', (req, res) => {
  console.log('Body of the application:', req.body);

  // Get values from the request body
  const { oldColumnId, newColumnId, cardId, newOrder } = req.body;
  // Validate that the necessary data is provided
  if (!oldColumnId || !newColumnId || !cardId || isNaN(newOrder)) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  // Update cards order in column, dcecrement order in bigger order (wher it was)
  db.query('UPDATE `cards` AS c  JOIN ( SELECT `order`, `column_id` FROM `cards` WHERE card_id = ? LIMIT 1 ) AS subquery ON c.`column_id` = subquery.`column_id` AND c.`order` >= subquery.`order` SET c.`order` = c.`order` - 1;', [cardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the moved 1' });
    }
    //Update cards in future column, increment order in bigger order (where it will be)
    db.query('UPDATE `cards` SET `order`=`order` + 1 WHERE `order` >= ? AND column_id = ?; ', [newOrder, newColumnId], (err, results) => {
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error in the moved 2' });
      }
      //Update card column and order
      db.query('UPDATE `cards` SET `order`=?, column_id = ? WHERE `card_id`=?;', [newOrder, newColumnId, cardId], (err, results) => {
        console.log('Resultado de la segunda consulta:', results);
        if (err) {
          console.error('Error in the query:', err);
          return res.status(500).json({ success: false, message: 'Error in the dragging' });
        }
      })
    })
    // If there is cahange will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({success: true, message: 'Card order updated successfully'});
    } else {
      return res.status(200).json({ success: false, message: 'Card order not updated' });
    }
  });
});

//Insert Board
app.post('/insertBoard', (req, res) => {
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

  // INSERT new board with the id, user, name, and last_update (now)
  db.query('INSERT INTO `boards`(`board_id`, `user_id`, `name`, `last_updated`) VALUES (?,?,?,(SELECT NOW())); ', [newBoardId, username, newBoardName], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If it is inserted correctly return the boardId
    if (results.affectedRows > 0) {
      return res.status(200).json({ boardId: newBoardId });
    } else {
      return res.status(200).json({ success: false, message: 'Board not inserted' });
    }
  });
});

//Insert Column
app.post('/insertColumn', (req, res) => {
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

  // Insert a new column with the id, name and board ID
  db.query('INSERT INTO `columns`(`column_id`, `name`, `board_id`) VALUES (?,?,?);', [newColumnId, newColumnName, boardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If it is inserted will return the data
    if (results.affectedRows > 0) {
      return res.status(200).json({ columnId: newColumnId, columnName: newColumnName, boardId: boardId });
    } else {
      return res.status(200).json({ success: false, message: 'Column not inserted' });
    }
  });
});
//Insert Card
app.post('/insertCard', (req, res) => {
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

  // Insert the card with the id, name and columnId
  db.query('INSERT INTO `cards`(`card_id`, `name`, `column_id`) VALUES (?,?,?);', [newCardId, newCardName, columnId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If it is inserted return the data of the card
    if (results.affectedRows > 0) {
      return res.status(200).json({ cardId: newCardId, cardName: newCardName, columnId: columnId });
    } else {
      return res.status(200).json({ success: false, message: 'Card not inserted' });
    }
  });
});
//Insert Property
app.post('/insertProperty', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the newPropertyName from the body
  const { newPropertyName, boardId } = req.body;

  //Generate the property_id with UUID v4
  const { v4: uuidv4 } = require('uuid');
  const newPropertyId = uuidv4();
  // Validate that the necessary data is provided
  if (!newPropertyName || !newPropertyId || !boardId ) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // INSERT the property with the id, name and board Id
  db.query('INSERT INTO `properties`(`property_id`, `name`, `board_id`) VALUES (?,?,?);', [newPropertyId, newPropertyName, boardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If it is inserted return the property data
    if (results.affectedRows > 0) {
      return res.status(200).json({ property_id: newPropertyId, property_name: newPropertyName, board_id: boardId });
    } else {
      return res.status(200).json({ success: false, message: 'Property not inserted' });
    }
  });
});
//Insert Property Type
app.post('/insertPropType', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the newPropTypeName, propertyId from the body
  const { newPropTypeName, propertyId } = req.body;

  //Generate the prop_type_id with UUID v4
  const { v4: uuidv4 } = require('uuid');
  const newPropTypeId = uuidv4();
  // Validate that the necessary data is provided
  if (!newPropTypeName || !newPropTypeId || !propertyId ) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Insert new prop type with the id, name and property id
  db.query('INSERT INTO `prop_types`(`prop_type_id`, `name`, `property_id`) VALUES (?,?,?)', [newPropTypeId, newPropTypeName, propertyId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If there is more than one note will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ prop_type_id: newPropTypeId, prop_type_name: newPropTypeName, property_id: propertyId });
    } else {
      return res.status(200).json({ success: false, message: 'Property not inserted' });
    }
  });
});

//Remove Board
app.post('/deleteBoard', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username from the body
  const { boardId } = req.body;
  // Validate that the necessary data is provided
  if (!boardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Delete board with the id
  db.query('DELETE FROM `boards` WHERE board_id=?; ', [boardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If it is deleted return the true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Board deleted' });
    } else {
      return res.status(200).json({ success: false, message: 'Board not deleted' });
    }
  });

});

//Remove Column
app.post('/deleteColumn', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the column id from the body
  const { columnId } = req.body;
  // Validate that the necessary data is provided
  if (!columnId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  //Move the columns to the left after the column
  db.query('UPDATE `columns` c JOIN (SELECT `order` FROM columns WHERE column_id = ? LIMIT 1) subquery ON c.`order` > subquery.`order` SET c.`order` = c.`order` - 1;', [columnId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // Delete column with the id
    db.query('DELETE FROM `columns` WHERE column_id=?; ', [columnId], (err, results) => {
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error in the Database' });
      }
    });
    // If it is deleted return true
    if (results.affectedRows > 0) {
      return res.status(200).json({success: true, message: 'Column deleted'});
    } else {
      return res.status(200).json({ success: false, message: 'Column not deleted' });
    }
  });
});
//Remove Card
app.post('/deleteCard', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the cardId and boardId from the body
  const { cardId } = req.body;
  // Validate that the necessary data is provided
  if (!cardId ) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  //Move the cards to the bottom after the column
  db.query('UPDATE `cards` c JOIN (SELECT `order`, `column_id` FROM cards WHERE card_id = ? LIMIT 1) subquery ON c.`order` > subquery.`order` AND c.column_id = subquery.`column_id` SET c.`order` = c.`order` - 1;', [cardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // Delete card with the id
    db.query('DELETE FROM `cards` WHERE card_id=?; ', [cardId], (err, results) => {
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error in the Database' });
      }
    });
    // If it is deleted return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Card deleted' });
    } else {
      return res.status(200).json({ success: false, message: 'Card not deleted' });
    }
  });
});
//Remove Property
app.post('/deleteProperty', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the propertyId and boardId from the body
  const { propertyId } = req.body;
  // Validate that the necessary data is provided
  if (!propertyId ) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  // Delete property with the id
  db.query('DELETE FROM `properties` WHERE property_id=?; ', [propertyId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If it is deleted will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Property not deleted' });
    } else {
      return res.status(200).json({ success: false, message: 'Property not deleted' });
    }
  });

});
//Remove Property Type
app.post('/deletePropType', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the propTypeId and boardId from the body
  const { propTypeId } = req.body;
  // Validate that the necessary data is provided
  if (!propTypeId ) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  // Delete property Type with the id
  db.query('DELETE FROM `prop_types` WHERE prop_type_id = ?; ', [propTypeId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If it is deleted will return the results
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: false, message: 'Prop Type deleted' });
    } else {
      return res.status(200).json({ success: false, message: 'Prop Type not deleted' });
    }
  });

});
//Remove Property Type for the card
app.post('/deletePropTypeCard', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the propTypeId, cardId and boardId from the body
  const { propTypeId, cardId } = req.body;
  // Validate that the necessary data is provided
  if (!propTypeId || !cardId ) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  // Delete property Type from the card with bouth ids
  db.query('DELETE FROM `card_prop_types` WHERE card_id=? AND prop_type_id=?; ', [cardId, propTypeId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
      // If there is more than one note will return true
      if (results.affectedRows > 0) {
        return res.status(200).json(results);
      } else {
        return res.status(200).json({ success: false, message: 'Prop Type not deleted from the card' });
      }
  });
});
//Get event from cards
app.post('/getEventFromCard', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the card id from the body
  const { cardId } = req.body;
  // Validate that the necessary data is provided
  if (!cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT the event for the card id
  db.query('SELECT E.start_date, E.end_date, E.event_id, E.name FROM `cards` C, `events` E WHERE C.card_id = E.card_id AND C.card_id= ? LIMIT 1;', [cardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the event doesn't exist will return false
    if (results.length > 0) {
      return res.status(200).json( results );
    } else {
      return res.status(200).json({ success: false, message: 'Event from card not found' });
    }
  });
});
//Insert an event
app.post('/insertEventUser', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username, eventName, startDate, endDate, cardId and boardId from the body
  const { username, eventName, startDate, endDate, cardId } = req.body;
  // Validate that the necessary data is provided
  if (!username || !eventName || !startDate || !endDate || !cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  //Generate the event_id with UUID v4
  const { v4: uuidv4 } = require('uuid');
  const eventId = uuidv4();
  // Insert the event with id, name, start and end date, card id and user id
  db.query('INSERT INTO `events`(`event_id`, `name`, `start_date`, `end_date`, `card_id`, `user_id`) VALUES (?,?,?,?,?,?);', [eventId, eventName, startDate, endDate, cardId, username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If it is inserted will return the event id
    if (results.affectedRows > 0) {
      return res.status(200).json({ eventId: eventId });
    } else {
      return res.status(200).json({ success: false, message: 'Event not inserted' });
    }
  });
});
//update an event
app.post('/updateEventDate', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the startDate, endDate, eventId and boardId from the body
  const { startDate, endDate, eventId } = req.body;
  // Validate that the necessary data is provided
  if (!startDate || !endDate || !eventId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Update start and end dat for the event id
  db.query('UPDATE `events` SET `start_date`=?,`end_date`=? WHERE event_id=?;', [startDate, endDate, eventId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If it is updated will return the results
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Event not Updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Event not Updated' });
    }
  });
});

//Update Card Content
app.post('/updateCardContent', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the cardId, content and boardId from the body
  const { cardId, content } = req.body;
  // Validate that the necessary data is provided
  if (!cardId ) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Update card content for the card id
  db.query('UPDATE `cards` SET `content`=? WHERE `card_id`=?;', [content, cardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If it is updated will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Card Updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Card not Updated' });
    }
  });

});
//Query to insert Property Type for a property of a card
app.post('/insertCardPropertyType', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the propTypeId, cardId from the body
  const { propTypeId, cardId } = req.body;
  // Validate that the necessary data is provided
  if (!propTypeId || !cardId ) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // insert the relation between the card id and the prop_type_id
  db.query('INSERT INTO `card_prop_types`(`card_id`, `prop_type_id`) VALUES (?,?)', [cardId, propTypeId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If the username doesn't exist will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Property Type not updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Property Type not updated' });
    }
  });
});

//Query to update Property Type for a property of a card
app.post('/updateCardPropertyType', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { oldPropTypeId, propTypeId, cardId } = req.body;
  // Validate that the necessary data is provided
  if (!oldPropTypeId || !propTypeId || !cardId ) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show properties of a card
  db.query('UPDATE `card_prop_types` SET `prop_type_id`=? WHERE card_id = ? AND prop_type_id = ?', [propTypeId, cardId, oldPropTypeId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If the username doesn't exist will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Property Type updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Property Type not updated' });
    }
  });
});
//Query to update Property Name for a property of a card
app.post('/updatePropertyName', (req, res) => {
  console.log('Body of the application:', req.body);
  const { newName, propertyId } = req.body;
  // Validate that the necessary data is provided
  if (!newName || !propertyId ) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  //Update property name with id
  db.query('UPDATE `properties` SET `name`=? WHERE property_id = ?', [newName, propertyId], (err, propResult) => {
    if (err) {
      console.error('Error updating property:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
      if (propResult.affectedRows > 0) {
        return res.status(200).json({ success: true, message: 'Property updated' });
      } else {
        return res.status(200).json({ success: false, message: 'Property not updated (no changes)' });
      }
  });
});
//Query to update Property Type Name
app.post('/updatePropTypeName', (req, res) => {
  const { newName, propTypeId } = req.body;
  // Validate that the necessary data is provided
  if (!newName || !propTypeId ) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  //Update prop_type name with the id
  db.query('UPDATE `prop_types` SET `name`=? WHERE prop_type_id =?', [newName, propTypeId], (err, propResult) => {
    if (err) {
      console.error('Error updating property:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    //Return result true if done
    if (propResult.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Property Type updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Property Type not updated' });
    }
  });
});

//--- Notes ---

//Insert Note
app.post('/insertNote', (req, res) => {
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

  // INSERT new note with the id, user, name amd last updated
  db.query('INSERT INTO `notes`(`note_id`, `name`, `user_id`, `last_updated`) VALUES (?,?,?,(SELECT NOW())); ', [newNoteId, newNoteName, username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If it is inserted correctly return the noteId
    if (results.affectedRows > 0) {
      return res.status(200).json({ noteId: newNoteId });
    } else {
      return res.status(200).json({ success: false, message: 'Note not inserted' });
    }
  });
});
//Query to get the note with the note_id
app.post('/getNoteById', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the note id from the body
  const { noteId } = req.body;
  // Validate that the necessary data is provided
  if (!noteId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to get the note with the id
  db.query('SELECT * FROM `notes` WHERE note_id = ?;', [noteId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is more than one note will return true
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Note not found' });
    }
  });
});
//Update Note Name
app.post('/updateNoteName', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the newName and board id from the bodyshow
  const { newName, noteId } = req.body;
  // Validate that the necessary data is provided
  if (!newName || !noteId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Update the name of a note and the last_updated
  db.query('UPDATE notes SET name = ?,last_updated = NOW() WHERE note_id = ?;', [newName, noteId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is a change return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Note name updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Note not found' });
    }
  });
});
//Remove Note
app.post('/deleteNote', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username from the body
  const { noteId } = req.body;
  // Validate that the necessary data is provided
  if (!noteId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Delete board with the id
  db.query('DELETE FROM `notes` WHERE note_id=?; ', [noteId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If it is deleted return the results
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Note deleted' });
    } else {
      return res.status(200).json({ success: false, message: 'Note not deleted' });
    }
  });

});
//Update Card Content
app.post('/updateNoteContent', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the cardId, content and boardId from the body
  const { noteId, content } = req.body;
  // Validate that the necessary data is provided
  if (!noteId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Update card content for the card id
  db.query('UPDATE `notes` SET `content`=? WHERE `note_id`=?;', [content, noteId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If it is updated will return the results
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Note content' });
    } else {
      return res.status(200).json({ success: false, message: 'Note content not Updated' });
    }
  });

});

//--- Query to get events from a month ---

app.post('/getEventsByMonth', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the username, month and year from the body
  const { username, month, year } = req.body;
  // Validate that the necessary data is provided
  if (!username || !month || !year) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to get the board with the id
  db.query('SELECT `event_id`, `name`, `start_date`, `end_date`, `card_id`, `location` FROM `events` WHERE user_id = ? AND MONTH(start_date) = ? AND YEAR(start_date) = ? ORDER BY start_date;', [username, month, year], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is more than one note will return true
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'No events for this month' });
    }
  });
});
//Insert Event
app.post('/insertEvent', (req, res) => {
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

  // INSERT new event with the name, startDate, endDate, username
  db.query('INSERT INTO `events`(`event_id`, `name`, `start_date`, `end_date`, `user_id`) VALUES (?, ?, ?, ?, ?)', [eventId, name, startDate, endDate, username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If it is inserted correctly return the eventId
    if (results.affectedRows > 0) {
      return res.status(200).json({ eventId: eventId });
    } else {
      return res.status(200).json({ success: false, message: 'Event not inserted' });
    }
  });
});
//Remove Event
app.post('/deleteEvent', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the eventId from the body
  const { eventId } = req.body;
  // Validate that the necessary data is provided
  if (!eventId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Delete Event with the id
  db.query('DELETE FROM `events` WHERE event_id=?; ', [eventId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If it is deleted return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Event deleted' });
    } else {
      return res.status(200).json({ success: false, message: 'Event not deleted' });
    }
  });
});
//Update Event
app.post('/updateEvent', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the name, startDate, endDate, location an eventId from the body
  const { name, startDate, endDate, location, eventId } = req.body;
  // Validate that the necessary data is provided
  if (!name || !startDate || !endDate || !eventId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Update the name of a board and the last_updated
  db.query('UPDATE events SET name = ?, start_date = ?, end_date = ?, location = ? WHERE event_id = ?;', [name, startDate, endDate, location, eventId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is a change return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Event updated' });
    } else {
      return res.status(200).json({ success: false, message: 'Event not updated' });
    }
  });
});

//--- Settings ---
//Query to show the User with the id
app.post('/getUserFromUserId', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the board from the body
  const { userId } = req.body;
  // Validate that the necessary data is provided
  if (!userId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show the columns from a board
  db.query('SELECT * FROM `users` WHERE user_id=?; ', [userId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the user exist return the results
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'User not found' });
    }
  });
});
//Update user data
app.post('/updateUser', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the firstName, secondName, newUsername, email, password and username from the body
  const { firstName, secondName, newUsername, email, username, avatar } = req.body;
  // Validate that the necessary data is provided
  if (!username || !firstName || !secondName || !newUsername || !email || !avatar) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Update the user with the id
  db.query('UPDATE `users` SET `user_id`=?,`first_name`=?,`second_name`=?,`email`=?,`image_url`=? WHERE `user_id` = ?;', [newUsername, firstName, secondName, email, avatar, username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is a change return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'User updated' });
    } else {
      return res.status(200).json({ success: false, message: 'User not updated' });
    }
  });
});
//Update user password
app.post('/updateUserPassword', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the password and username from the body
  const { password, username } = req.body;
  // Validate that the necessary data is provided
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Update the user with the id
  db.query('UPDATE `users` SET `password`=? WHERE `user_id` = ?;', [password, username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is a change return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'User Password updated' });
    } else {
      return res.status(200).json({ success: false, message: 'User Password not updated' });
    }
  });
});



/*Open port*/
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening in http://localhost:${port}`);
});
