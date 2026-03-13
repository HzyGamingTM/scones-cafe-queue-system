import NotFound from "@/components/NotFound";
import LightPillar from "@/components/LightPillar";

export default function RealNotFoundPage() {
    return (
        <div suppressHydrationWarning> 
            <NotFound/>
            <div className="w-max h-max">
                <LightPillar
                    topColor="#5227FF"
                    bottomColor="#FF9FFC"
                    intensity={1}
                    rotationSpeed={0.3}
                    glowAmount={0.002}
                    pillarWidth={3}
                    pillarHeight={0.4}
                    noiseIntensity={0.5}
                    pillarRotation={25}
                    interactive={false}
                    mixBlendMode="screen"
                    quality="high"
                />
            </div>
        </div>
    );
}