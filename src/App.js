import React, { useState, useEffect } from 'react';

// REPLACE THIS WITH YOUR GOOGLE APPS SCRIPT URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxyXTvtrpyHxOKeBP6ICP08IAoamFOXJJWsQg5byTEy0YZXiEhKVUbuujyyiUCuWonD/exec';

function App() {
  const [view, setView] = useState('home');
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [users, setUsers] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from Google Sheets on component mount
  useEffect(() => {
    fetch(APPS_SCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        setUsers(data.users);
        setWorkouts(data.workouts);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setError('Failed to load workout data');
        setLoading(false);
      });
  }, []);

  const selectUser = (userName) => {
    const user = users.find(u => u.user === userName);
    setSelectedUser(user);
    setView('workout');
    setCurrentWeek(1);
    setCurrentDay(1);
  };

  const getWorkoutName = (day) => {
    if (!selectedUser) return '';
    const dayMap = {
      1: selectedUser.day1Workout,
      2: selectedUser.day2Workout,
      3: selectedUser.day3Workout,
      4: selectedUser.day4Workout
    };
    return dayMap[day] || '';
  };

  const getCurrentWorkouts = () => {
    if (!selectedUser) return [];
    const workoutName = getWorkoutName(currentDay);
    return workouts.filter(w => 
      w.user === selectedUser.user && 
      w.week === currentWeek && 
      w.workout === workoutName
    );
  };

  const goToWeek = (week) => {
    setCurrentWeek(week);
  };

  const navigateWeek = (direction) => {
    const newWeek = currentWeek + direction;
    if (newWeek >= 1 && newWeek <= 4) {
      setCurrentWeek(newWeek);
    }
  };

  const navigateDay = (direction) => {
    const newDay = currentDay + direction;
    if (newDay >= 1 && newDay <= 4) {
      setCurrentDay(newDay);
    }
  };

  if (view === 'home') {
    if (loading) {
      return (
        <div style={styles.container}>
          <div style={styles.homeContainer}>
            <h1 style={styles.homeTitle}>Loading...</h1>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={styles.container}>
          <div style={styles.homeContainer}>
            <h1 style={styles.homeTitle}>Error</h1>
            <p style={styles.homeSubtitle}>{error}</p>
            <p style={styles.homeSubtitle}>Make sure you've updated the APPS_SCRIPT_URL</p>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.container}>
        <div style={styles.homeContainer}>
          <h1 style={styles.homeTitle}>Wendler 5/3/1</h1>
          <p style={styles.homeSubtitle}>Select Your Profile</p>
          <div style={styles.buttonContainer}>
            {users.map(user => (
              <button 
                key={user.user}
                style={styles.userButton}
                onClick={() => selectUser(user.user)}
              >
                {user.user}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentWorkouts = getCurrentWorkouts();
  const workoutName = getWorkoutName(currentDay);

  return (
    <div style={styles.container}>
      <div style={styles.workoutContainer}>
        {/* Header */}
        <div style={styles.header}>
          <button 
            style={styles.backButton}
            onClick={() => setView('home')}
          >
            ← Back
          </button>
          <h2 style={styles.userName}>{selectedUser?.user}</h2>
        </div>

        {/* Week and Day Navigation */}
        <div style={styles.navSection}>
          <div style={styles.weekNav}>
            <button 
              style={{...styles.navArrow, opacity: currentWeek === 1 ? 0.3 : 1}}
              onClick={() => navigateWeek(-1)}
              disabled={currentWeek === 1}
            >
              ◀
            </button>
            <div style={styles.weekInfo}>
              <div style={styles.weekLabel}>Week {currentWeek}</div>
              <div style={styles.dayLabel}>Day {currentDay} - {workoutName}</div>
            </div>
            <button 
              style={{...styles.navArrow, opacity: currentWeek === 4 ? 0.3 : 1}}
              onClick={() => navigateWeek(1)}
              disabled={currentWeek === 4}
            >
              ▶
            </button>
          </div>

          <div style={styles.weekButtons}>
            {[1, 2, 3, 4].map(week => (
              <button
                key={week}
                style={{
                  ...styles.weekButton,
                  ...(currentWeek === week ? styles.weekButtonActive : {})
                }}
                onClick={() => goToWeek(week)}
              >
                W{week}
              </button>
            ))}
          </div>

          <div style={styles.dayButtons}>
            {[1, 2, 3, 4].map(day => (
              <button
                key={day}
                style={{
                  ...styles.dayButton,
                  ...(currentDay === day ? styles.dayButtonActive : {})
                }}
                onClick={() => setCurrentDay(day)}
              >
                Day {day}
              </button>
            ))}
          </div>
        </div>

        {/* Workout Cards */}
        <div style={styles.cardsContainer}>
          {currentWorkouts.length === 0 ? (
            <div style={styles.noWorkout}>No workout data for this day</div>
          ) : (
            currentWorkouts.map((w, index) => {
              return (
                <div key={index} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{w.workout}</h3>
                    <div style={styles.sequenceBadge}>Set {w.sequence}</div>
                  </div>
                  <div style={styles.cardBody}>
                    <div style={styles.statRow}>
                      <div style={styles.stat}>
                        <div style={styles.statLabel}>Reps</div>
                        <div style={styles.statValue}>{w.reps}</div>
                      </div>
                      <div style={styles.stat}>
                        <div style={styles.statLabel}>Percentage</div>
                        <div style={styles.statValue}>{w.percentage}%</div>
                      </div>
                    </div>
                    <div style={styles.weightSection}>
                      <div style={styles.totalWeight}>
                        <div style={styles.weightLabel}>Total Weight</div>
                        <div style={styles.weightValue}>{w.weightLbs} lbs</div>
                      </div>
                      <div style={styles.perSideWeight}>
                        <div style={styles.weightLabel}>Per Side</div>
                        <div style={styles.weightValueSmall}>{w.weightPerSide} lbs</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  homeContainer: {
    maxWidth: '500px',
    margin: '0 auto',
    paddingTop: '60px',
    textAlign: 'center',
  },
  homeTitle: {
    fontSize: '3.5rem',
    color: 'white',
    marginBottom: '10px',
    fontWeight: '800',
  },
  homeSubtitle: {
    fontSize: '1.5rem',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '50px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  userButton: {
    fontSize: '2rem',
    padding: '30px',
    background: 'white',
    border: 'none',
    borderRadius: '15px',
    cursor: 'pointer',
    fontWeight: '700',
    color: '#1e3c72',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  workoutContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '15px',
  },
  backButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    fontSize: '1.1rem',
    padding: '10px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  userName: {
    color: 'white',
    fontSize: '2rem',
    fontWeight: '700',
  },
  navSection: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '20px',
  },
  weekNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  navArrow: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    fontSize: '2rem',
    width: '50px',
    height: '50px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekInfo: {
    textAlign: 'center',
    flex: 1,
  },
  weekLabel: {
    color: 'white',
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '5px',
  },
  dayLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '1.3rem',
    fontWeight: '600',
  },
  weekButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginBottom: '15px',
  },
  weekButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    fontSize: '1.1rem',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  weekButtonActive: {
    background: 'white',
    color: '#1e3c72',
  },
  dayButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
  },
  dayButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    fontSize: '1rem',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  dayButtonActive: {
    background: 'white',
    color: '#1e3c72',
  },
  cardsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  card: {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '1.8rem',
    color: '#1e3c72',
    fontWeight: '700',
  },
  sequenceBadge: {
    background: '#1e3c72',
    color: 'white',
    padding: '8px 15px',
    borderRadius: '20px',
    fontSize: '1rem',
    fontWeight: '600',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  statRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  stat: {
    textAlign: 'center',
    padding: '15px',
    background: '#f5f5f5',
    borderRadius: '10px',
  },
  statLabel: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '5px',
    fontWeight: '600',
  },
  statValue: {
    fontSize: '2rem',
    color: '#1e3c72',
    fontWeight: '800',
  },
  weightSection: {
    display: 'flex',
    gap: '15px',
  },
  totalWeight: {
    flex: 2,
    background: '#1e3c72',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
  },
  perSideWeight: {
    flex: 1,
    background: '#2a5298',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
  },
  weightLabel: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '8px',
    fontWeight: '600',
  },
  weightValue: {
    fontSize: '2.5rem',
    color: 'white',
    fontWeight: '800',
  },
  weightValueSmall: {
    fontSize: '1.8rem',
    color: 'white',
    fontWeight: '800',
  },
  noWorkout: {
    textAlign: 'center',
    color: 'white',
    fontSize: '1.5rem',
    padding: '40px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '15px',
  },
};

export default App;