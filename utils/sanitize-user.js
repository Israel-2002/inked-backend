exports.sanitizeUser = (userDoc) => {
    const user = userDoc.toObject()

    delete user.password
    delete user.refresh_token

    return user
}