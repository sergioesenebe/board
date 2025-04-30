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
  port: process.env.DB_PORT
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


/*Example query*/
app.get('/users', (req, res) => {
  db.query('SELECT * FROM User', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});
/*Query for the login*/
app.post('/login', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { username, password } = req.body;

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
      return res.status(200).json({ success: true });
    } else {
      return res.status(200).json({ success: false, message: 'Incorrect User or Password' });
    }
  });
});

/*Query to check username for signup*/
app.post('/checkUsername', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to verify if the user and password are correct
  db.query('SELECT * FROM users WHERE user_id = ?', [username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the username doesn't exist will return true
    if (results.length == 0) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(200).json({ success: false, message: 'Username already exists' });
    }
  });
});
/*Query to check email for signup*/
app.post('/checkEmail', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to verify if the user and password are correct
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the username doesn't exist will return true
    if (results.length == 0) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(200).json({ success: false, message: 'Email already in use' });
    }
  });
});

/*Query to insert a new user for signup*/
app.post('/insertUser', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { first_name, second_name, username, email, password, avatar } = req.body;
  if (!first_name || !second_name || !username || !email || !password || !avatar) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Insert the user
  db.query('INSERT INTO `users`(`user_id`, `first_name`, `second_name`, `email`, `password`, `image_url`) VALUES (?,?,?,?,?,?)', [username, first_name, second_name, email, password, avatar], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the username doesn't exist will return true
    return res.status(200).json({ success: true });
  });
});
/*Query to get user first name*/
app.post('/getUserFirstName', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to verify if the user and password are correct
  db.query('SELECT first_name FROM users WHERE user_id = ?', [username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the username doesn't exist will return true
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
  // Takes the usernames and passwords from the body
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show the image for user
  db.query('SELECT image_url FROM users WHERE user_id = ?', [username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the username doesn't exist will return true
    if (results.length > 0) {
      return res.status(200).json({ image_url: results[0].image_url });
    } else {
      return res.status(200).json({ success: false, message: 'Username not found' });
    }
  });
});
//Query to show the boards of a user
app.post('/getBoards', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show the image for user
  db.query('SELECT board_id, name FROM boards WHERE user_id = ? ORDER BY last_updated DESC', [username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the username doesn't exist will return true
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Username not found' });
    }
  });
});
//Query to show the columns of a board
app.post('/getColumns', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { board } = req.body;

  if (!board) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show the image for user
  db.query('SELECT column_id, name FROM `columns` WHERE board_id=? ORDER By `order`; ', [board], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the username doesn't exist will return true
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Board not found' });
    }
  });
});
//Query to show number of cards
app.post('/getCardsNumber', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { column } = req.body;

  if (!column) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show the number of cards for a column
  db.query('SELECT count(*) AS number FROM `cards` WHERE column_id=?', [column], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the username doesn't exist will return true
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Column not found' });
    }
  });
});
//Query to show cards of a column
app.post('/getCards', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { column } = req.body;

  if (!column) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show the number of cards for a column
  db.query('SELECT * FROM `cards` WHERE column_id=? ORDER By `order`', [column], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the username doesn't exist will return true
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Column not found' });
    }
  });
});
//Query to show cards of a column
app.post('/getProperties', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { card } = req.body;

  if (!card) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show properties of a card
  db.query('SELECT PT.prop_type_id, PT.name AS prop_type_name, P.name AS property_name FROM `card_prop_types` CPT, prop_types PT, properties P WHERE CPT.prop_type_id=PT.prop_type_id AND PT.property_id=P.property_id AND CPT.card_id = ?;', [card], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the username doesn't exist will return true
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Card not found' });
    }
  });
});
//Query to show all properties and selected card
app.post('/getPropertiesAndTypes', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { cardId, boardId } = req.body;

  if (!cardId || !boardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show properties of a card
  db.query('SELECT P.name AS property_name, COALESCE(MAX(CASE WHEN CPT.card_id IS NOT NULL THEN PT.name ELSE NULL END), NULL) AS prop_type_name FROM properties P LEFT JOIN prop_types PT ON P.property_id=PT.property_id LEFT JOIN card_prop_types CPT ON PT.prop_type_id=CPT.prop_type_id AND card_id=? WHERE P.board_id=? GROUP BY P.name; ', [cardId, boardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the username doesn't exist will return true
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Card not found' });
    }
  });
});

//Query to show the notes of a user
app.post('/getNotes', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to get notes
  db.query('SELECT note_id, name, content FROM `notes` WHERE user_id=? ORDER BY last_updated', [username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is more than one note will return true
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Username not found' });
    }
  });
});
//Query to show first event
app.post('/getUpcomingEvent', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show first event
  db.query('SELECT * FROM events E, calendars C WHERE E.end_date >= CURRENT_DATE AND C.user_id=? AND E.calendar_id = C.calendar_id ORDER BY E.end_date LIMIT 1;', [username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is more than one note will return true
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
  // Takes the usernames and passwords from the body
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT last used board last column from a user
  db.query('SELECT C.name, C.column_id, C.board_id FROM `columns` C, boards B WHERE B.board_id =(SELECT board_id FROM boards WHERE user_id=? ORDER BY last_updated DESC LIMIT 1) AND B.board_id = C.board_id ORDER BY `order` DESC;  ', [username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is more than one note will return true
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Username not found' });
    }
  });
});
//Query to get the board with the board_id
app.post('/getBoardById', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { boardId } = req.body;

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
//Query to show month events
app.post('/addYellowToEvents', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { username, month } = req.body;

  if (!username || !month) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show month events for a user
  db.query('SELECT * FROM events E, calendars C WHERE MONTH(E.start_date) = ? AND C.user_id=? AND E.calendar_id = C.calendar_id;', [month, username], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is more than one note will return true
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Username not found' });
    }
  });
});
//Update Board Name
app.post('/updateBoardName', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { newName, board } = req.body;

  if (!newName || !board) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show month events for a user
  db.query('UPDATE boards SET name = ?,last_updated = NOW() WHERE board_id = ?;', [newName, board], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is more than one note will return true
    if (results.affectedRows > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Board not found' });
    }
  });
});
//Update Column Name
app.post('/updateColumnName', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { newName, column } = req.body;

  if (!newName || !column) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show month events for a user
  db.query('UPDATE `columns` SET `name`=? WHERE `column_id`=?;', [newName, column], (err, results) => {
    console.log('Resultado de la segunda consulta:', results);

    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    db.query('UPDATE boards SET last_updated = NOW() WHERE board_id = (SELECT board_id FROM columns WHERE column_id=?)', [column], (err, results) => {
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error in the update time query' });
      }

    });

    // If there is more than one note will return true
    if (results.affectedRows > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Column not found' });
    }
  });

});
//Update Column Order when move from left to right
app.post('/updateColumnOrderIncrease', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { columnId, newOrder } = req.body;

  if (!columnId || isNaN(newOrder)) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show month events for a user
  db.query('UPDATE `columns` AS c  JOIN ( SELECT `order`,`board_id` FROM `columns` WHERE column_id = ? LIMIT 1 ) AS subquery ON c.`board_id` = subquery.`board_id` AND c.`order` <= ? AND c.`order` >= subquery.`order` SET c.`order` = c.`order` - 1; ', [columnId, newOrder], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the moved' });
    }
    db.query('UPDATE `columns` SET `order`=? WHERE `column_id`=?;', [newOrder, columnId], (err, results) => {
      console.log('Resultado de la segunda consulta:', results);
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error in the dragging' });
      }
      db.query('UPDATE boards SET last_updated = NOW() WHERE board_id = (SELECT board_id FROM columns WHERE column_id=?)', [columnId], (err, results) => {
        if (err) {
          console.error('Error in the query:', err);
          return res.status(500).json({ success: false, message: 'Error in the update time query' });
        }
      });
    })

    // If there is more than one note will return true
    if (results.affectedRows > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Column not found' });
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
      db.query('UPDATE boards SET last_updated = NOW() WHERE board_id = (SELECT board_id FROM columns WHERE column_id=?)', [columnId], (err, results) => {
        if (err) {
          console.error('Error in the query:', err);
          return res.status(500).json({ success: false, message: 'Error in the update time query' });
        }
      });

      // Check if the update was successful
      if (results.affectedRows > 0) {
        return res.status(200).json({ success: true, message: 'Column order updated successfully', data: results });
      } else {
        return res.status(404).json({ success: false, message: 'Column not found' });
      }
    });
  });
});
//Update Card Order when move from left to right
app.post('/updateCardOrderIncrease', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { oldColumnId, newColumnId, cardId, newOrder } = req.body;

  if (!oldColumnId || !newColumnId || !cardId || isNaN(newOrder)) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  //Just update card position in the column
  if (oldColumnId === newColumnId) {
    // Update cards order in column
    db.query('UPDATE `cards` AS c  JOIN ( SELECT `order`,`column_id` FROM `cards` WHERE card_id = ? LIMIT 1 ) AS subquery ON c.`column_id` = subquery.`column_id` AND c.`order` <= ? AND c.`order` >= subquery.`order` SET c.`order` = c.`order` - 1; ', [cardId, newOrder], (err, results) => {
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error in the moved' });
      }
      db.query('UPDATE `cards` SET `order`=? WHERE `card_id`=?;', [newOrder, cardId], (err, results) => {
        console.log('Resultado de la segunda consulta:', results);
        if (err) {
          console.error('Error in the query:', err);
          return res.status(500).json({ success: false, message: 'Error in the dragging' });
        }
        db.query('UPDATE boards SET last_updated = NOW() WHERE board_id = (SELECT board_id FROM columns WHERE column_id=?)', [newColumnId], (err, results) => {
          if (err) {
            console.error('Error in the query:', err);
            return res.status(500).json({ success: false, message: 'Error in the update time query' });
          }
        });
      })

      // If there is more than one note will return true
      if (results.affectedRows > 0) {
        return res.status(200).json(results);
      } else {
        return res.status(200).json({ success: false, message: 'Column not found' });
      }
    });
  }
  //Update card to other column and position
  else {
    // Update cards order in column
    db.query('UPDATE `cards` AS c  JOIN ( SELECT `order`, `column_id` FROM `cards` WHERE card_id = ? LIMIT 1 ) AS subquery ON c.`column_id` = subquery.`column_id` AND c.`order` >= subquery.`order` SET c.`order` = c.`order` - 1;', [cardId], (err, results) => {
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error in the moved 1' });
      }
      //Update cards in future column
      db.query('UPDATE `cards` SET `order`=`order` + 1 WHERE `order` >= ? AND column_id = ?; ', [newOrder, newColumnId], (err, results) => {
        if (err) {
          console.error('Error in the query:', err);
          return res.status(500).json({ success: false, message: 'Error in the moved 2' });
        }
        db.query('UPDATE `cards` SET `order`=?, column_id = ? WHERE `card_id`=?;', [newOrder, newColumnId, cardId], (err, results) => {
          console.log('Resultado de la segunda consulta:', results);
          if (err) {
            console.error('Error in the query:', err);
            return res.status(500).json({ success: false, message: 'Error in the dragging' });
          }
          db.query('UPDATE boards SET last_updated = NOW() WHERE board_id = (SELECT board_id FROM columns WHERE column_id=?)', [newColumnId], (err, results) => {
            if (err) {
              console.error('Error in the query:', err);
              return res.status(500).json({ success: false, message: 'Error in the update time query' });
            }
          });

        })
      })
      // If there is more than one note will return true
      if (results.affectedRows > 0) {
        return res.status(200).json(results);
      } else {
        return res.status(200).json({ success: false, message: 'Column not found' });
      }
    });
  }
});
//Update Card Order when move from right to left
app.post('/updateCardOrderDecrease', (req, res) => {
  console.log('Body of the application:', req.body);

  // Get values from the request body
  const { oldColumnId, newColumnId, cardId, newOrder } = req.body;
  // Validate that the necessary data is provided
  if (!oldColumnId || !newColumnId || !cardId || isNaN(newOrder)) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  if (oldColumnId === newColumnId) {
    // Update the order of columns by incrementing the order of columns after the selected one
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
        db.query('UPDATE boards SET last_updated = NOW() WHERE board_id = (SELECT board_id FROM columns WHERE column_id=?)', [newColumnId], (err, results) => {
          if (err) {
            console.error('Error in the query:', err);
            return res.status(500).json({ success: false, message: 'Error in the update time query' });
          }
        });


        // Check if the update was successful
        if (results.affectedRows > 0) {
          return res.status(200).json({ success: true, message: 'Column order updated successfully', data: results });
        } else {
          return res.status(404).json({ success: false, message: 'Column not found' });
        }
      });
    });
  }
  else {
    // Update cards order in column
    db.query('UPDATE `cards` AS c  JOIN ( SELECT `order`, `column_id` FROM `cards` WHERE card_id = ? LIMIT 1 ) AS subquery ON c.`column_id` = subquery.`column_id` AND c.`order` >= subquery.`order` SET c.`order` = c.`order` + 1;', [cardId], (err, results) => {
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error in the moved 1' });
      }
      //Update cards in future column
      db.query('UPDATE `cards` SET `order`=`order` + 1 WHERE `order` >= ? AND column_id = ?; ', [newOrder, newColumnId], (err, results) => {
        if (err) {
          console.error('Error in the query:', err);
          return res.status(500).json({ success: false, message: 'Error in the moved 2' });
        }
        db.query('UPDATE `cards` SET `order`=?, column_id = ? WHERE `card_id`=?;', [newOrder, newColumnId, cardId], (err, results) => {
          console.log('Resultado de la segunda consulta:', results);
          if (err) {
            console.error('Error in the query:', err);
            return res.status(500).json({ success: false, message: 'Error in the dragging' });
          }
          db.query('UPDATE boards SET last_updated = NOW() WHERE board_id = (SELECT board_id FROM columns WHERE column_id=?)', [newColumnId], (err, results) => {
            if (err) {
              console.error('Error in the query:', err);
              return res.status(500).json({ success: false, message: 'Error in the update time query' });
            }
          });

        })
      })
      // If there is more than one note will return true
      if (results.affectedRows > 0) {
        return res.status(200).json(results);
      } else {
        return res.status(200).json({ success: false, message: 'Column not found' });
      }
    });
  }
});

//Insert Board
app.post('/insertBoard', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { newBoardName, username } = req.body;

  //Generate the column_id with UUID v4
  const { v4: uuidv4 } = require('uuid');
  const newBoardId = uuidv4();


  if (!newBoardName || !newBoardId || !username) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show month events for a user
  db.query('INSERT INTO `boards`(`board_id`, `user_id`, `name`, `last_updated`) VALUES (?,?,?,(SELECT NOW())); ', [newBoardId, username, newBoardName], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // If there is more than one note will return true
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
  // Takes the usernames and passwords from the body
  const { newColumnName, boardId } = req.body;

  //Generate the column_id with UUID v4
  const { v4: uuidv4 } = require('uuid');
  const newColumnId = uuidv4();


  if (!newColumnName || !newColumnId || !boardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // Insert a new column
  db.query('INSERT INTO `columns`(`column_id`, `name`, `board_id`) VALUES (?,?,?);', [newColumnId, newColumnName, boardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    db.query('UPDATE boards SET last_updated = NOW() WHERE board_id = (SELECT board_id FROM columns WHERE column_id=?)', [newColumnId], (err, results) => {
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error in the update time query' });
      }

    });

    // If there is more than one note will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ columnId: newColumnId, columnName: newColumnName, boardId: boardId });
    } else {
      return res.status(200).json({ success: false, message: 'Column not found' });
    }
  });
});
//Insert Card
app.post('/insertCard', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { newCardName, columnId } = req.body;

  //Generate the column_id with UUID v4
  const { v4: uuidv4 } = require('uuid');
  const newCardId = uuidv4();

  if (!newCardName || !newCardId || !columnId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show month events for a user
  db.query('INSERT INTO `cards`(`card_id`, `name`, `column_id`) VALUES (?,?,?);', [newCardId, newCardName, columnId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    db.query('UPDATE boards SET last_updated = NOW() WHERE board_id = (SELECT board_id FROM columns WHERE column_id=?)', [columnId], (err, results) => {
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error in the update time query' });
      }

    });

    // If there is more than one note will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ cardId: newCardId, cardName: newCardName, columnId: columnId });
    } else {
      return res.status(200).json({ success: false, message: 'Column not found' });
    }
  });
});

//Remove Board
app.post('/deleteBoard', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { boardId } = req.body;


  if (!boardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to show month events for a user
  db.query('DELETE FROM `boards` WHERE board_id=?; ', [boardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If there is more than one note will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({ results });
    } else {
      return res.status(200).json({ success: false, message: 'Column not found' });
    }
  });

});

//Remove Column
app.post('/deleteColumn', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { columnId } = req.body;
  if (!columnId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  //Move the columns to the left after the column
  db.query('UPDATE `columns` c JOIN (SELECT `order` FROM columns WHERE column_id = ? LIMIT 1) subquery ON c.`order` > subquery.`order` SET c.`order` = c.`order` - 1;', [columnId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // Delete column
    db.query('DELETE FROM `columns` WHERE column_id=?; ', [columnId], (err, results) => {
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error in the Database' });
      }
      //Update last_updated board
      db.query('UPDATE boards SET last_updated = NOW() WHERE board_id = (SELECT board_id FROM columns WHERE column_id=?)', [columnId], (err, results) => {
        if (err) {
          console.error('Error in the query:', err);
          return res.status(500).json({ success: false, message: 'Error in the update time query' });
        }
      });
    });
    // If there is more than one note will return true
    if (results.affectedRows > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Board not found' });
    }
  });
});
//Remove Card
app.post('/deleteCard', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { cardId, boardId } = req.body;


  if (!cardId || !boardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  //Move the columns to the left after the column
  db.query('UPDATE `cards` c JOIN (SELECT `order`, `column_id` FROM cards WHERE card_id = ? LIMIT 1) subquery ON c.`order` > subquery.`order` AND c.column_id = subquery.`column_id` SET c.`order` = c.`order` - 1;', [cardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    // Delete column
    db.query('DELETE FROM `cards` WHERE card_id=?; ', [cardId], (err, results) => {
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error in the Database' });
      }
      //Update last_updated board
      db.query('UPDATE boards SET last_updated = NOW() WHERE board_id = ?;', [boardId], (err, results) => {
        if (err) {
          console.error('Error in the query:', err);
          return res.status(500).json({ success: false, message: 'Error in the update time query' });
        }
      });
    });
    // If there is more than one note will return true
    if (results.affectedRows > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Card not found' });
    }
  });
});
//Get event from cards
app.post('/getEventFromCard', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { cardId } = req.body;

  if (!cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  // SELECT to verify if the user and password are correct
  db.query('SELECT E.start_date, E.end_date, E.event_id, E.name FROM `cards` C, `events` E WHERE C.card_id = E.card_id AND C.card_id= ? LIMIT 1;', [cardId], (err, results) => {
    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }

    // If the event doesn't exist will return true
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(200).json({ success: false, message: 'Event not found' });
    }
  });
});
//Insert an event
app.post('/insertEventUser', (req, res) => {
  console.log('Body of the application:', req.body);
  // Takes the usernames and passwords from the body
  const { username, eventName, startDate, endDate, cardId, boardId } = req.body;
  if (!username || !eventName || !startDate || !endDate || !cardId) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }
  //Generate the cevent_id with UUID v4
  const { v4: uuidv4 } = require('uuid');
  const eventId = uuidv4();
  // SELECT to show month events for a user
  db.query('INSERT INTO `events`(`event_id`, `name`, `start_date`, `end_date`, `card_id`, `user_id`) VALUES (?,?,?,?,?,?);', [eventId, eventName, startDate, endDate, cardId, username], (err, results) => {
    console.log('Resultado de la segunda consulta:', results);

    if (err) {
      console.error('Error in the query:', err);
      return res.status(500).json({ success: false, message: 'Error in the Database' });
    }
    db.query('UPDATE boards SET last_updated = NOW() WHERE board_id = ?', [boardId], (err, results) => {
      if (err) {
        console.error('Error in the query:', err);
        return res.status(500).json({ success: false, message: 'Error inserting the event' });
      }

    });
    // If there is more than one note will return true
    if (results.affectedRows > 0) {
      return res.status(200).json({eventId: eventId});
    } else {
      return res.status(200).json({ success: false, message: 'Column not found' });
    }
  });
});



/*Open port*/
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening in http://localhost:${port}`);
});
