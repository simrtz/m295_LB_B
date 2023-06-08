const express = require('express');
const fs = require('fs');

const router = express.Router();
router.use(express.json());

const taskData = './resources/tasks.json';

router.get('/', async (req, res) => {
  if (req.session.authenticated) {
    const tasks = JSON.parse(await fs.promises.readFile(taskData)
      .catch((err) => res.status(500).json({ error: `An Error occured while retrieving data. Err: ${err}` })));

    if (!tasks) {
      res.status(404).json({ error: 'no tasks found' });
    }

    res.status(200).json(tasks);
  } else {
    res.status(403).json({ error: 'Unauthorized to access this Endpoint' });
  }
});

router.get('/:id', async (req, res) => {
  if (req.session.authenticated) {
    const { id } = req.params;

    const tasks = JSON.parse(await fs.promises.readFile(taskData)
      .catch((err) => res.status(500).json({ error: `An Error occured while retrieving data. Err: ${err}` })));

    const task = tasks.find((wantedTask) => wantedTask.id === id);

    if (!task) {
      res.status(404).json({ error: `no task with id: '${id}' found` });
    }

    res.status(200).json(task);
  } else {
    res.status(403).json({ error: 'Unauthorized to access this Endpoint' });
  }
});

router.post('/', async (req, res) => {
  if (req.session.authenticated) {
    const newTask = req.body;
    const tasks = JSON.parse(await fs.promises.readFile(taskData)
      .catch((err) => res.status(500).json({ error: `An Error occured while retrieving data. Err: ${err}` })));

    if ((!newTask.id && typeof newTask.id === 'string')
          || (!newTask.title && typeof newTask.title === 'string')
          || (!newTask.year && typeof newTask.title === 'number')
          || (!newTask.author && typeof newTask.id === 'string')
    ) {
      res.status(422).json({ error: "Json is invalid. Required properties are: 'id': Number, 'title': String, 'Author': String, 'author': String" });
    } else if (tasks.find((task) => task.id === newTask.id)) {
      res.status(400).json({ error: `task with id: '${newTask.id}' already exists` });
    } else {
      tasks.push(newTask);
      await fs.promises.writeFile(taskData, JSON.stringify(tasks, null, 2))
        .catch((err) => res.status(500).json({ error: `An Error occured while writing data. Err: ${err}` }));

      res.status(201).json(newTask);
    }
  } else {
    res.status(403).json({ error: 'Unauthorized to access this Endpoint' });
  }
});

router.put('/:id', async (req, res) => {
  if (req.session.authenticated) {
    const updatedBook = req.body;
    const { id } = req.params;

    const tasks = JSON.parse(await fs.promises.readFile(taskData)
      .catch((err) => res.status(500).json({ error: `An Error occured while retrieving data. Err: ${err}` })));

    if ((!updatedBook.id && typeof updatedBook.id === 'string')
          || (!updatedBook.title && typeof updatedBook.title === 'string')
          || (!updatedBook.year && typeof updatedBook.title === 'number')
          || (!updatedBook.author && typeof updatedBook.id === 'string')
    ) {
      res.status(422).json({ error: "Json is invalid. Required properties are: 'id': String, 'title': String, 'year': Number, 'author': String" });
    } else if (!tasks.find((task) => task.id === updatedBook.id)) {
      res.status(400).json({ error: `task with id: '${updatedBook.id}' already exists` });
    } else {
      const task = tasks.find((wantedTask) => wantedTask.id === id);

      if (!task) {
        res.status(404).json({ error: `no task with id: '${id}' found` });
      } else {
        tasks[tasks.indexOf(task)] = updatedBook;
        await fs.promises.writeFile(taskData, JSON.stringify(tasks, null, 2))
          .catch((err) => res.status(500).json({ error: `An Error occured while writing data. Err: ${err}` }));

        res.status(200).json(updatedBook);
      }
    }
  } else {
    res.status(403).json({ error: 'Unauthorized to access this Endpoint' });
  }
});

router.delete('/:id', async (req, res) => {
  if (req.session.authenticated) {
    const { id } = req.params;
    const tasks = JSON.parse(await fs.promises.readFile(taskData)
      .catch((err) => res.status(500).json({ error: `An Error occured while retrieving data. Err: ${err}` })));
    const task = tasks.find((wantedTask) => wantedTask.id === id);

    if (!task) {
      res.status(404).json({ error: `no task with id: '${id}' found` });
    } else {
      tasks.splice(tasks.indexOf(task));
      await fs.promises.writeFile(taskData, JSON.stringify(tasks, null, 2))
        .catch((err) => res.status(500).json({ error: `An Error occured while writing data. Err: ${err}` }));

      res.sendStatus(204);
    }
  } else {
    res.status(403).json({ error: 'Unauthorized to access this Endpoint' });
  }
});

module.exports = router;
