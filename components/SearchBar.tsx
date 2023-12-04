"use client"
import { scrapAndStoreProduct } from '@/lib/actions';
import { FormEvent, useState } from 'react'

const isValidAmazonProductUrl = (url: string) => {
    try {
        const parseUrl = new URL(url);
        const hostname = parseUrl.hostname;

        if (
            hostname.includes('amazon.com') ||
            hostname.includes('amazon.') ||
            hostname.endsWith('amazon')
        ) {
            return true;
        }
    } catch {
        return false;
    }
}

const SearchBar = () => {
    const [searchPrompts, setSearchPrompts] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const isValidLink = isValidAmazonProductUrl(searchPrompts);

        if (!isValidLink) return alert('Please provide a valid Amazon link')

        try {
            setIsLoading(true);
            const product = await scrapAndStoreProduct(searchPrompts);




        } catch (error) {   
            console.log(error);

        } finally {
            setIsLoading(false)
        }
    }



    return (
        <form className='flex flex-wrap gap-4 mt-12'
            onSubmit={handleSubmit}
        >
            <input
                type="text"
                value={searchPrompts}
                onChange={(e) => setSearchPrompts(e.target.value)}
                placeholder="Enter Product Link"
                className="searchbar-input"
            />

            <button
                type="submit"
                className="searchbar-btn"
                disabled={searchPrompts === ""}
            >
                {isLoading ? 'Searching...' : 'Search'}
            </button>


        </form>
    )
}

export default SearchBar