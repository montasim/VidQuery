import welcome from '../src/index';

describe('welcome', () => {
    it('should log the welcome message', () => {
        const consoleSpy = jest
            .spyOn(console, 'info')
            .mockImplementation(() => {});

        welcome();

        expect(consoleSpy).toHaveBeenCalledWith(
            'Welcome to the npm boilerplate.'
        );

        consoleSpy.mockRestore();
    });
});
