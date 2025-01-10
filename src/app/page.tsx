import AuthenticationWrapper from "@/components/AuthenticationWrapper";
import ExerciseManager from "@/components/ExerciseManager";
import { WorkoutProvider } from "@/components/WorkoutContext";

const Home: React.FC = () => {
  return (
    <AuthenticationWrapper>
      <WorkoutProvider>
        <ExerciseManager />
      </WorkoutProvider>
    </AuthenticationWrapper>
  );
};

export default Home;
