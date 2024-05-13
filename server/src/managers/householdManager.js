const households = [
    {
        "_id": "1",
        "name": "Съквартиранти",
        "members": [
            { "userId": "1", "role": "Админ" },
            { "userId": "2", "role": "Член" }
        ],
        "admin": { "userId": "1" },
        "balance": [
            { "userId": "1", "sum": 60, "type": "+" },
            { "userId": "2", "sum": 60, "type": "-" }
        ],
    },
    {
        "_id": "2",
        "name": "Вкъщи",
        "members": [
            { "userId": "1", "role": "Член" },
            { "userId": "2", "role": "Член" },
            { "userId": "3", "role": "Админ" }
        ],
        "admin": { "userId": "3" },
        "balance": [
            { "userId": "1", "sum": 30, "type": "-" },
            { "userId": "2", "sum": 30, "type": "-" },
            { "userId": "3", "sum": 60, "type": "+" }
        ],
    },
    {
        "_id": "3",
        "name": "Обмен",
        "members": [
            { "userId": "1", "role": "Член" },
            { "userId": "2", "role": "Админ" }
        ],
        "admin": { "userId": "2" },
        "balance": [
            { "userId": "1", "sum": 0, "type": "+" },
            { "userId": "2", "sum": 0, "type": "+" }
        ],
    }
]

exports.getAll = () => households.slice();

exports.getOne = (householdId) => households.find(x => x._id == householdId);

// TODO: Send email instead of id?
exports.getOneReducedData = (householdId) => {
    const household = households.find(x => x._id == householdId);
    // if (!household) return null;

    const { name, members } = household;
    
    return { name, members };
};

exports.create = (householdData) => {
    const balance = [householdData.admin, ...householdData.members].map(user => ({
        userId: user.userId,
        sum: 0,
        type: "+"
    }));

    const newHousehold = {
        // TODO generate new id
        _id: `${households.length + 1}`,
        //createdAt...
        ...householdData,
        balance,
    };

    households.push(newHousehold);

    return newHousehold;
};