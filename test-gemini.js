const apiKey = 'AIzaSyDLB6yhhq1zWlKdzLVbAvUbUIJh66cs5g4';

async function run() {
    try {
        const list = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await list.json();
        console.log(data.models.map(m => m.name).filter(name => name.includes('flash')));
    } catch (error) {
        console.error(error);
    }
}

run();
