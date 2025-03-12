const MESSAGES = {

    // auth
    1001: 'User created successfully',
    1002: 'User not created',
    1003: 'ID is required',
    1004: 'User not found',
    1005: 'User fetched successfully',
    1006: 'User updated successfully',
    1007: 'User deleted successfully',
    1008: 'Users fetched successfully',

    // defaults
    9999: 'Internal server error',
};


const get_message = message_code => {
    if (isNaN(message_code)) {
        return message_code;
    }
    return message_code ? MESSAGES[message_code] : '';
};

export { get_message };
