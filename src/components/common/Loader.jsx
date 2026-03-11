import { motion } from 'framer-motion';
import './Loader.css';

const Loader = ({ size = 'md', text = 'Loading...' }) => {
    // Wave animation variants
    const waveVariants = {
        initial: {
            scaleY: 0.5,
            opacity: 0.5,
        },
        animate: {
            scaleY: 1.5,
            opacity: 1,
            transition: {
                repeat: Infinity,
                repeatType: "mirror",
                duration: 0.5,
                ease: "easeInOut",
            },
        },
    };

    const containerSize = size === 'lg' ? 60 : size === 'sm' ? 20 : 40;
    const barWidth = size === 'lg' ? 8 : size === 'sm' ? 3 : 5;
    const gap = size === 'lg' ? 6 : size === 'sm' ? 2 : 4;

    return (
        <div className={`loader-container ${size}`}>
            <div
                className="loader-wave"
                style={{
                    display: 'flex',
                    gap: `${gap}px`,
                    height: `${containerSize}px`,
                    alignItems: 'center'
                }}
            >
                {[0, 1, 2, 3, 4].map((index) => (
                    <motion.div
                        key={index}
                        variants={waveVariants}
                        initial="initial"
                        animate="animate"
                        transition={{
                            delay: index * 0.1,
                        }}
                        style={{
                            width: `${barWidth}px`,
                            height: '100%',
                            backgroundColor: 'var(--color-accent)',
                            borderRadius: '4px',
                        }}
                    />
                ))}
            </div>
            {text && (
                <motion.p
                    className="loader-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
};

export default Loader;
