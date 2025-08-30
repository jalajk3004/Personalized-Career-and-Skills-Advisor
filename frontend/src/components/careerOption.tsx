
import { useParams } from 'react-router-dom';

const CareerOption = () => {

    const { userId, recommendationId } = useParams();

  return (
    <div>
      <h1>id is: {userId},{recommendationId}</h1>
    </div>
  )
}

export default CareerOption;
