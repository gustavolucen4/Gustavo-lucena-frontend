import { ReactNode } from "react";
import Menu from "../Menu";
import { Post } from "../../models/Post";

interface MainScreenProps {
    children: ReactNode;
    postCreated?: (post: Post) => void;
}

function MainScreen(props: MainScreenProps){

    return(
        <div className="w-screen h-screen flex">
            <Menu postCreated={props.postCreated}/>
            {props.children}
        </div>
    );
}

export default MainScreen;