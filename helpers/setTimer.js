


module.exports= async function setTimer(startTime, endTime) {
  clearTimeout(); //for resetting the timeOut;
  const timer = (Math.floor(Math.random() * (endTime - startTime + 1)) + startTime) * 1000;
  console.log('repeating after', timer / 1000, 'seconds');

  setTimeout(() => {
    fetch('http://localhost:8080/go');
  }, timer);
}