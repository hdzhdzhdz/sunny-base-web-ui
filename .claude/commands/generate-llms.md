# Generate LLM Documentation

Generate `llms.txt` and `llms-full.txt` from the @ui component library source code.

## Steps

1. Run the generation script:
   ```bash
   pnpm generate:llms
   ```

2. After generation completes, review the output files:
   - `docs/src/public/llms.txt` - Concise component index
   - `docs/src/public/llms-full.txt` - Full API reference

3. If any components are missing or have incomplete documentation:
   - Check the component's `types.ts` file for proper JSDoc comments
   - Ensure Props interface follows naming convention: `ComponentNameProps`
   - Ensure Emits interface follows: `ComponentNameEmits`
   - Ensure Expose interface follows: `ComponentNameExpose`

4. To preview output without writing files:
   ```bash
   pnpm generate:llms --dry-run
   ```

## Notes

- The script uses ts-morph to parse TypeScript source code
- Components are discovered from `packages/@ui/src/` directory structure
- Only components with `types.ts` or `.vue`/`.tsx` files are included
- The generated files include a timestamp for tracking freshness
