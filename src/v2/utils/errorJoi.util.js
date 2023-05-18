function handleJoiError({ details }) {
    // return details.map(({ message, path }) => ({ [`${path[0]}`]: message }));
    let errors = {};
    details.forEach(({ message, context }) => {
        const { key } = context;

        errors[key] = message;
    });
    return errors;
}

module.exports = handleJoiError;
