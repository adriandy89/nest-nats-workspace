module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: './coverage',
    testEnvironment: 'node',
    roots: ['<rootDir>/apps/', '<rootDir>/libs/'],
    moduleNameMapper: {
        '^@app/database(|/.*)$': '<rootDir>/libs/database/src/$1',
        '^@app/dtos/(.*)$': '<rootDir>/libs/dtos/src/$1',
        '^@app/dtos$': '<rootDir>/libs/dtos/src',
    },
};