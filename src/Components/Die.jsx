const Die = ({ value, id, holdFn, isHeld }) => {
  return (
    <div>
      <button
        type="button"
        style={{ backgroundColor: isHeld ? "#59E391" : "#ffff" }}
        className="die-btn"
        onClick={() => holdFn(id)}
      >
        {value}
      </button>
    </div>
  );
};

export default Die;
