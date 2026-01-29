
import { Circle, X } from "lucide-react";

export default function TicTacToeIcon() {
    return (
        <div className="relative w-28 h-28">
            <div
                className="absolute inset-0 m-auto bg-[#ffffff]"
                style={{
                    width: "12px",
                    height: "90px",
                    borderRadius: "9999px",
                }}
            />

            <div
                className="absolute inset-0 m-auto bg-[#ffffff]"
                style={{
                    width: "90px",
                    height: "12px",
                    borderRadius: "9999px",
                }}
            />

            <X
                size={34}
                strokeWidth={3}
                color="#ffffff"
                className="absolute"
                style={{ top: "6px", right: "6px" }}
            />

            <Circle
                size={25}
                strokeWidth={3}
                color="#ffffff"
                className="absolute"
                style={{ bottom: "12px", left: "12px" }}
            />
        </div>
    );
}
