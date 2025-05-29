
const ListingCategory = (props) => {
    const {label, icon: Icon, description} = props;
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-row items-center gap-4">
                <Icon size={40} className="text-neutral-600"/>
                <div className="flex flex-col">
                    <div className="text-lg font-semibold">
                        {label}
                    </div>
                    <div className="text-md text-neutral-500">
                        {description}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ListingCategory;