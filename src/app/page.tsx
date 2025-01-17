import AuthenticationWrapper from "@/components/AuthenticationWrapper";
import ExerciseManager from "@/components/ExerciseManager";

const Home: React.FC = () => {
  return (
    <AuthenticationWrapper>
        <ExerciseManager />
    </AuthenticationWrapper>
  );
};

export default Home;
