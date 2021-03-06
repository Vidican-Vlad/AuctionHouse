import styles from "../styles/History.module.css"
import Picture from "./Picture";
import format from 'date-fns/format'
import {useRouter} from 'next/router';

const BidItem = ({bid}) => {
    const router = useRouter();
    const toPost=(e)=>{
        e.preventDefault();
        router.push(`/post/${post.postID}`)

    }
    return ( 
        <div onClick={toPost} className={styles.postItem}>
            <Picture postID = {bid.postID}/>
            <div className={styles.description}>{bid.description}</div> 
            <div className={styles.priceDate}>
                <div>Ends at:</div>
                <div>{format(Date.parse(bid.endTime), 'd.MM.Y H:m')}</div> 
                <div>Price: ${bid.currentPrice}</div>
                </div>
        </div>
     );
}
 
export default BidItem;