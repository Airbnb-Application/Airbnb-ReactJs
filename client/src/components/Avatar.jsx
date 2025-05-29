const Avatar = (props) => {
    const { imageSrc } = props
    let avatar = ""
    if (imageSrc) {
        avatar = imageSrc
    } else {
        avatar = localStorage.getItem("authImage")
        if (avatar === "undefined") {
            avatar = "/placeholder.jpg"
        }
    }
    
    return (
        <img className="rounded-full" height={30} width={30} alt="Avatar" src={avatar ? avatar : "/placeholder.jpg"} ></img>
    )
}

export default Avatar