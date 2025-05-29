import getAllPlaces from "../action/getAllPlaces";

const EditProfilePage = () => {
    return (
        <div>
            <h2 className="font-bold text-xxl text-start" style={{fontSize: '32px', marginBottom: '50px'}}>Personal
                info</h2>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <p style={{marginBottom: '0px'}}>Full name</p>
                    <p style={{marginBottom: '20px'}}>Nguyen Dinh Minh</p>
                </div>
                <button style={{marginLeft: '50px'}}>Edit</button>
            </div>

            <hr/>

            <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <p style={{marginBottom: '0px'}}>Email address</p>
                    <p style={{marginBottom: '20px'}}>admin@gmail.com</p>
                </div>
                <button style={{marginLeft: '50px'}}>Edit</button>
            </div>

            <hr/>

            <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <p style={{marginBottom: '0px'}}>Phone number</p>
                    <p style={{marginBottom: '20px'}}>0943242243</p>
                </div>
                <button style={{marginLeft: '50px'}}>Edit</button>
            </div>

            <hr/>

            <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <p style={{marginBottom: '0px'}}>Where I live</p>
                    <p style={{marginBottom: '20px'}}>Hanoi, Vietname</p>
                </div>
                <button style={{marginLeft: '50px'}}>Edit</button>
            </div>

            <hr/>

            <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <p style={{marginBottom: '0px'}}>Where I went to college</p>
                    <p style={{marginBottom: '20px'}}>Posts and Telecommunications Institute of Technology</p>
                </div>
                <button style={{marginLeft: '50px'}}>Edit</button>
            </div>

            <hr/>

            <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <p style={{marginBottom: '0px'}}>My work</p>
                    <p style={{marginBottom: '20px'}}>大学生</p>
                </div>
                <button style={{marginLeft: '50px'}}>Edit</button>
            </div>

            <hr/>

            <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <p style={{marginBottom: '0px'}}>Language I speak</p>
                    <p style={{marginBottom: '20px'}}>English and Vietnamese</p>
                </div>
                <button style={{marginLeft: '50px'}}>Edit</button>
            </div>

            <hr/>

            <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <p style={{marginBottom: '0px'}}>Mu fun fact</p>
                    <p style={{marginBottom: '20px'}}>I'm not funny</p>
                </div>
                <button style={{marginLeft: '50px'}}>Edit</button>
            </div>

            <hr/>

            <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <p style={{marginBottom: '0px'}}>My description</p>
                    <p style={{marginBottom: '20px'}}>Something ...</p>
                </div>
                <button style={{marginLeft: '50px'}}>Edit</button>
            </div>

            <hr/>
        </div>
    );
};

export default EditProfilePage;