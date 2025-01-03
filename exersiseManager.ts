export {}
         
// const [inputValue, setInputValue] = useState("");
// const [exercises, setExercises] = useState<Exercise[]>([]);
// const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
// const [error, setError] = useState<string | null>(null);
// const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
// const [confirmModalOpen, setConfirmModalOpen] = useState(false);
// const [confirmationInput, setConfirmationInput] = useState("");
// const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
//   null
// );
// const [editingId, setEditingId] = useState<string | null>(null); // Tracks which exercise is being edited
// const [newName, setNewName] = useState<string>(""); // Temporary name for editing

//   // Fetch exercises for the authenticated user
//   const fetchExercises = useCallback(async () => {
//     try {
//       setError(null);

//       const { data: session, error: sessionError } =
//         await supabase.auth.getSession();

//       if (sessionError || !session?.session) {
//         setError("You must be logged in to view exercises.");
//         return;
//       }

//       const { data, error } = await supabase
//         .from("exercises")
//         .select("id, name")
//         .eq("user_id", session.session.user.id);

//       if (error) {
//         setError(error.message);
//         return;
//       }

//       setExercises(data || []);
//       setFilteredExercises(data || []);
//     } catch (err) {
//       setError("An unexpected error occurred.");
//       console.error("error:", err);
//     }
//   }, []);

//   const saveEdit = async (exerciseId: string) => {
//     if (!newName.trim()) {
//       setError("Exercise name cannot be empty.");
//       return;
//     }

//     console.log(`Attempting to save edit for exercise ID: ${exerciseId}`);
//     console.log(`New name: ${newName.trim()}`);

//     try {
//       const { data, error } = await supabase
//         .from("exercises")
//         .update({ name: newName.trim() })
//         .eq("id", exerciseId);

//       if (error) {
//         console.error("Error updating exercise in database:", error);
//         setError("Failed to update exercise.");
//         return;
//       }

//       console.log("Update successful. Updated exercise data:", data);

//       setExercises((prev) =>
//         prev.map((ex) =>
//           ex.id === exerciseId ? { ...ex, name: newName.trim() } : ex
//         )
//       );
//       setEditingId(null);
//       setNewName("");
//     } catch (err) {
//       console.error("Unexpected error during update:", err);
//       setError("Failed to update exercise.");
//     }
//   };

//   const handleDeleteExercise = async () => {
//     if (!selectedExercise) return;

//     console.log(`Attempting to delete exercise ID: ${selectedExercise.id}`);

//     try {
//       // Perform the delete operation
//       const { data, error } = await supabase
//         .from("exercises")
//         .delete()
//         .eq("id", selectedExercise.id);

//       if (error) {
//         console.error("Error deleting exercise from database:", error);
//         setError("Failed to delete exercise.");
//         return;
//       }

//       console.log("Delete successful. Deleted exercise data:", data);

//       // Remove the deleted exercise from the local state
//       setExercises((prev) =>
//         prev.filter((exercise) => exercise.id !== selectedExercise.id)
//       );
//       setFilteredExercises((prev) =>
//         prev.filter((exercise) => exercise.id !== selectedExercise.id)
//       );

//       // Close the confirmation modal
//       setConfirmModalOpen(false);
//       setSelectedExercise(null);
//     } catch (err) {
//       console.error("Unexpected error during delete:", err);
//       setError("Failed to delete exercise.");
//     }
//   };

//            const isAddButtonHighlighted =
//            inputValue.trim() &&
//            !exercises.some(
//              (exercise) =>
//                exercise.name.toLowerCase() === inputValue.trim().toLowerCase()
//            );
       
//          // Add a new exercise for the authenticated user
//          const handleAddExercise = async () => {
//            setError(null);
       
//            if (!inputValue.trim()) {
//              setError("Exercise name cannot be empty.");
//              return;
//            }
       
//            const existingExercise = exercises.some(
//              (exercise) =>
//                exercise.name.toLowerCase() === inputValue.trim().toLowerCase()
//            );
       
//            if (existingExercise) {
//              setError("This exercise already exists");
//              return;
//            }
       
//            const { data: session } = await supabase.auth.getSession();
//            if (!session?.session) {
//              setError("You must be logged in to add exercises.");
//              return;
//            }
       
//            const { error } = await supabase.from("exercises").insert({
//              user_id: session.session.user.id,
//              name: inputValue.trim(),
//            });
       
//            if (error) {
//              setError(error.message);
//            } else {
//              setInputValue("");
//              fetchExercises(); // Refresh the list of exercises
//            }
//          };
       
//          const cancelEdit = () => {
//            setEditingId(null);
//            setNewName("");
//          };
       
//          // Fetch exercises on component mount
//          useEffect(() => {
//            fetchExercises();
//          }, [fetchExercises]);

//            const handleSearch = (query: string) => {
//             setInputValue(query);
        
//             if (!query.trim()) {
//               setFilteredExercises(exercises); // Shows all exercises if input is empty
//               return;
//             }
        
//             const fuse = new Fuse(exercises, { keys: ["name"], threshold: 0.4 });
//             const results = fuse.search(query).map((result) => result.item);
//             setFilteredExercises(results);
//           };
        
//           const handleSubmit = (e: React.FormEvent) => {
//             e.preventDefault(); // Prevent the page from reloading
//             handleAddExercise();
//           };
        
//           const handleEdit = (exerciseId: string, currentName: string) => {
//             setMenuOpenId(null); // Close the menu
//             setEditingId(exerciseId); // Set the exercise being edited
//             setNewName(currentName); // Pre-fill the input with the current name
//           };
         
//          const toggleMenu = (exerciseId: string) => {
//             setMenuOpenId((prev) => (prev === exerciseId ? null : exerciseId));
//           };
        
//           const openConfirmModal = (exercise: Exercise) => {
//             setSelectedExercise(exercise);
//             setConfirmModalOpen(true);
//             setMenuOpenId(null);
//           };
       
//        {/* Input for adding a new exercise/searching */}
//        <form className="flex items-center gap-4 mb-6" onSubmit={handleSubmit}>
//        <input
//          type="text"
//          placeholder="Search or add a new exercise"
//          value={inputValue}
//          onChange={(e) => handleSearch(e.target.value)}
//          className="flex-1 p-3 rounded-md bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
//        />
//        <button
//          type="submit"
//          disabled={!isAddButtonHighlighted}
//          className={`py-3 px-6 rounded-md shadow-md transition duration-300 ${
//            isAddButtonHighlighted
//              ? "bg-blue-600 text-white hover:bg-blue-700"
//              : "bg-gray-600 text-gray-400 cursor-not-allowed"
//          }`}
//        >
//          Add
//        </button>
//      </form>

//      {error && <p className="text-red-500 text-sm mb-6">{error}</p>}

//      {/* List of existing exercises */}
//      <div className="space-y-3">
//        {filteredExercises.length > 0 ? (
//          filteredExercises.map((exercise) => (
//            <div
//              key={exercise.id}
//              className="relative bg-gray-800 rounded-md p-4"
//            >
//              {editingId === exercise.id ? (
//                <div className="flex items-center gap-2">
//                  <input
//                    type="text"
//                    value={newName}
//                    onChange={(e) => setNewName(e.target.value)}
//                    className="p-2 bg-gray-700 text-white rounded-md"
//                  />
//                  <button
//                    onClick={() => saveEdit(exercise.id)}
//                    className="text-green-500 hover:text-green-700"
//                  >
//                    <CheckIcon />
//                  </button>
//                  <button
//                    onClick={cancelEdit}
//                    className="text-red-500 hover:text-red-700"
//                  >
//                    <CloseIcon />
//                  </button>
//                </div>
//              ) : (
//                <>
//                  <Link
//                    href={`/exercises/${
//                      exercise.id
//                    }?name=${encodeURIComponent(exercise.name)}`}
//                    className="block text-white mr-4"
//                  >
//                    {exercise.name}
//                  </Link>
//                  {/* Three-dot menu */}
//                  <button
//                    onClick={() => toggleMenu(exercise.id)}
//                    className="absolute text-2xl font-extrabold top-3 right-4 text-gray-400 hover:text-white"
//                  >
//                    &#x22EE;
//                  </button>
//                  {menuOpenId === exercise.id && (
//                    <div className="absolute top-8 right-4 z-10 bg-gray-700 p-2 rounded-md shadow-lg">
//                      {/* Edit Exercise Button */}
//                      <button
//                        onClick={() => handleEdit(exercise.id, exercise.name)}
//                        className="block rounded-md shadow-sm shadow-slate-800 px-2 text-blue-500 hover:text-blue-700 mb-2"
//                      >
//                        Edit
//                      </button>
//                      {/* Delete Exercise Button */}
//                      <button
//                        onClick={() => openConfirmModal(exercise)}
//                        className="block rounded-md shadow-sm shadow-slate-800 px-2 text-red-500 hover:text-red-700"
//                      >
//                        Delete
//                      </button>
//                    </div>
//                  )}
//                </>
//              )}
//            </div>
//          ))
//        ) : (
//          <div className="text-center text-gray-400">
//            No exercises found. Start by adding one!
//          </div>
//        )}
//      </div>
//    </div>

//    {/* Confirmation Modal */}
//    {confirmModalOpen && selectedExercise && (
//      <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
//        <div className="bg-gray-800 p-6 rounded-md max-w-sm w-full text-center">
//          <h2 className="text-xl font-bold text-white mb-4">
//            Confirm Delete
//          </h2>
//          <p className="text-gray-400 mb-4">
//            Deleting <strong>{selectedExercise.name}</strong> will remove all
//            associated records. This action cannot be undone.
//          </p>
//          <input
//            type="text"
//            placeholder={`Type "DELETE" to confirm`}
//            value={confirmationInput}
//            onChange={(e) => setConfirmationInput(e.target.value)}
//            className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none mb-4"
//          />
//          <button
//            onClick={handleDeleteExercise}
//            disabled={confirmationInput !== "DELETE"}
//            className={`w-full py-3 rounded-md ${
//              confirmationInput === "DELETE"
//                ? "bg-red-600 text-white hover:bg-red-700"
//                : "bg-gray-600 text-gray-400 cursor-not-allowed"
//            }`}
//          >
//            Confirm Delete
//          </button>
//          <button
//            onClick={() => setConfirmModalOpen(false)}
//            className="mt-4 w-full py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600"
//          >
//            Cancel
//          </button>
//        </div>
//      </div>
//    )}