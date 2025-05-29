import qs from 'query-string'
import { useNavigate } from 'react-router-dom';
import { useCallback} from 'react';
import useSearchUrl from '../hooks/useSearchUrl';
const CategoryBox = (props) => {
    const { label, selected, icon: Icon } = props;
    const { setSearchUrl } = useSearchUrl();
    const navigate = useNavigate();
    
    const urlParams = new URLSearchParams(window.location.search);
    const handleClick = useCallback(() => {
        let currentQuery = {};
        
        if (urlParams) {
          currentQuery = qs.parse(urlParams.toString())
        }
    
        const updatedQuery = {
          ...currentQuery,
          category: label
        }
    
        if (urlParams?.get('category') === label) {
          delete updatedQuery.category;
        }
    
        const url = qs.stringifyUrl({
          url: '/',
          query: updatedQuery
        }, { skipNull: true });
        setSearchUrl(url);
        navigate(url);
      }, [label, navigate, urlParams]);

    return (
        <div 
            onClick={handleClick}
            className={`
            flex 
            flex-col 
            items-center 
            justify-center 
            gap-2
            p-3 
            border-b-2 
            hover:text-neutral-800 
            transition 
            cursor-pointer
            ${selected ? 'border-b-neutral-800' : 'border-transparent'}
            ${selected ? 'text-neutral-800' : 'text-neutral-500'}  
        `}>
            <Icon size={24} />
            <p className="text-xs font-medium">{label}</p>
        </div>
    )
}

export default CategoryBox;