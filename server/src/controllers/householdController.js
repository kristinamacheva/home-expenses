const router = require('express').Router();

const households = [
    {
        "_id": "1",
        "name": "Съквартиранти",
        "members": [
            { "userId": "1", "role": "Админ" },
            { "userId": "2", "role": "Член" }
        ],
        "balance": [
            { "userId": "1", "sum": 60, "type": "+" },
            { "userId": "2", "sum": 60, "type": "-" }
        ],
        "admin": { "userId": "1" }
    },
    {
        "_id": "2",
        "name": "Вкъщи",
        "members": [
            { "userId": "1", "role": "Член" },
            { "userId": "2", "role": "Член" },
            { "userId": "3", "role": "Админ" }
        ],
        "balance": [
            { "userId": "1", "sum": 30, "type": "-" },
            { "userId": "2", "sum": 30, "type": "-" },
            { "userId": "3", "sum": 60, "type": "+" }
        ],
        "admin": { "userId": "3" }
    },
    {
        "_id": "3",
        "name": "Обмен",
        "members": [
            { "userId": "1", "role": "Член" },
            { "userId": "2", "role": "Админ" }
        ],
        "balance": [
            { "userId": "1", "sum": 0, "type": "+" },
            { "userId": "2", "sum": 0, "type": "+" }
        ],
        "admin": { "userId": "2" }
    }
]

router.get('/', (req, res) => {
    res.json(households);
});

router.post('/', (req, res) => {
    console.log(req.body);
    res.json(req.body);
});

module.exports = router;