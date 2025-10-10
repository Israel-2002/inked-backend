exports.sanitizeUser = (userDoc) => {
    const user = userDoc.toObject()
    user.id = user._id

    delete user.__v
    delete user._id
    delete user.personal_info.password
    delete user.refresh_token

    return user
}