const Heading = (props) => {
    const {title, subtitle, center} = props;
    return (
        <div className={center ? 'text-center' : 'text-start'}>
            <div className="text-xl font-bold">
                {title}
            </div>
            <div className="font-light text-neutral-500 mt-2">
                {subtitle}
            </div>
        </div>
    )
}

export default Heading;