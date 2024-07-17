import { useEffect, useState, useRef } from "react";
import getRequestWithNativeFetch from "../../utils/nativeFetch";

import BooksBySubject from "../../types/booksBySubject";

import styles from './Hero.module.scss'

interface HeroData {
    title: string;
    coverURL: string;
}

export default function Hero() {
    const [data, setData] = useState<HeroData[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const carouselRef = useRef<HTMLDivElement | null>(null);
    const carouselIndex = useRef(0);

    function generateHeroData(data:BooksBySubject[]) {
        const randomIndex = Math.floor(Math.random() * 10);
        const selectedBooks = data.map(subject => subject.works[randomIndex]);

        const heroBookData = selectedBooks.map(book => {
            const newData:HeroData = {
                'title': book.title,
                'coverURL': `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
            };
            return newData;   
        });

        return heroBookData;
    }

    function randomOffset(maxNum:number) {
        return Math.floor(Math.random() * maxNum);
    }

    useEffect(() => {
        const thrillerSuspenseUrl = `https://openlibrary.org/subjects/fiction_thrillers_suspense.json?offset=${randomOffset(34200)}`;
        const historicalFictionUrl = `https://openlibrary.org/subjects/historical_fiction.json?offset=${randomOffset(7000)}`;
        const selfHelpUrl = `https://openlibrary.org/subjects/self-help.json?offset=${randomOffset(2300)}`;

        async function fetchHeroBooksData() {
            try {
                const result = await Promise.all([
                    getRequestWithNativeFetch(thrillerSuspenseUrl),
                    getRequestWithNativeFetch(historicalFictionUrl),
                    getRequestWithNativeFetch(selfHelpUrl)
                ]);

                const heroBooksDataJson = await result;
                const newHeroData =  generateHeroData(heroBooksDataJson);
                setData(newHeroData);
                setError(null);
            } catch (err) {
                if (err instanceof Error) setError(err.message);
                setData(null);
            } finally {
                setLoading(false);
            }
        } 

        fetchHeroBooksData();
    }, []);

    function slideCarousel(forward:boolean) {
        let maxIndex:number;

        if (carouselRef.current) {
            maxIndex = carouselRef.current.childElementCount - 1;
        } else return;

        if (forward) {
            carouselIndex.current === maxIndex
            ? carouselIndex.current = 0
            : carouselIndex.current += 1
        } else {
            carouselIndex.current === 0
            ? carouselIndex.current = maxIndex
            : carouselIndex.current -= 1
        }

        carouselRef.current.style.transform = `translate(-${carouselIndex.current * 100}%)`;
    }

    return (
        <section className={styles.hero}>
            <div className={styles.subjectSearch}>
                <label htmlFor="book-search">Search book subject</label>
                <input type="search" id="book-search" name="book-subject"/>
                <button>Search</button>
            </div>
            <button 
                className={styles.sliderBtn} 
                data-dir="left" 
                onClick={() => slideCarousel(false)}
            >
                L
            </button>
            <button 
                className={styles.sliderBtn} 
                data-dir="right" 
                onClick={() => slideCarousel(true)}
            >
                R
            </button>
            <div className={styles.carouselContainer} ref={carouselRef}>
                <div className={styles.categoryHighlight} data-highlight="1">
                    <div className={styles.bookImage}>
                        <img src={data && data[0].coverURL} alt="" />
                    </div>
                    <h2>THRILLERS, SUSPENSE</h2>
                    <p>
                        Heart-pounding reads that keep you guessing, perfect for those who crave adrenaline-fueled adventures and can't resist a good plot twist.
                    </p>
                    <button>SHOP NOW</button>
                </div>
                <div className={styles.categoryHighlight} data-highlight="2">
                    <div className={styles.bookImage}>
                        <img src={data && data[1].coverURL} alt="" />
                    </div>
                    <h2>HISTORICAL FICTION</h2>
                    <p>
                        Journey through time and different eras with captivating tales. These books promise to educate, entertain, and inspire.
                    </p>
                    <button>SHOP NOW</button>
                </div>
                <div className={styles.categoryHighlight} data-highlight="3">
                    <div className={styles.bookImage}>
                        <img src={data && data[2].coverURL} alt="" />
                    </div>
                    <h2>SELF-HELP</h2>
                    <p>
                        Your companions on the journey to becoming your best self, whether you're seeking to improve your mindset, build better habits, or navigate life's challenges.
                    </p>
                    <button>SHOP NOW</button>
                </div>
            </div>
        </section>
    )
}
