const CategoryInput = (props) => {
    const { label, icon: Icon, selected, onClick } = props;
    return (
        <div 
            id="category"
            onClick={() => onClick(label)}
            className={`
                rounded-xl 
                border-2 
                p-4 
                flex 
                flex-col 
                gap-3 
                hover:border-black 
                transition
                cursor-pointer
                ${selected ? 'border-black' : 'border-neutral-200'}
            `}>    
            <Icon size={31}/>
            <div className="font-semibold">
                {label}
            </div>
        </div>
    )
}

export  default CategoryInput;