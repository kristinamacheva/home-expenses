const getHousehold = (req, res, next) => {
    req.householdId = req.params.householdId;
    next();
}

module.exports = getHousehold;