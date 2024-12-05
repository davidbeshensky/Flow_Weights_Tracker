import AuthenticationWrapper from '@/components/AuthenticationWrapper';
import ExerciseManager from '@/components/ExerciseManager';
import SignOutButton from '@/components/SignOutButton';
import { Sign } from 'crypto';

const Home: React.FC = () => {
  return (
    <AuthenticationWrapper>
      <ExerciseManager />
    </AuthenticationWrapper>
  );
};

export default Home;